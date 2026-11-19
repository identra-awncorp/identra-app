const assert = require('node:assert/strict');
const { describe, it } = require('node:test');

const {
  parseQrScanValue,
} = require('../.tmp-test/src/native/domain/scan/qrScan');

describe('qrScan', () => {
  const now = Date.parse('2026-07-23T00:00:00.000Z');

  it('accepts active Identra references without exposing embedded credential data', () => {
    assert.deepEqual(
      parseQrScanValue(
        'identra://credential-presentation?request=request-123&expires=2026-07-23T00%3A03%3A00.000Z',
        now,
      ),
      {
        kind: 'identra',
        purpose: 'credential-presentation',
        requestId: 'request-123',
        expiresAt: '2026-07-23T00:03:00.000Z',
      },
    );
  });

  it('rejects expired and malformed Identra references', () => {
    assert.deepEqual(
      parseQrScanValue(
        'identra://connection-invitation?request=request-456&expires=2026-07-23T00%3A00%3A00.000Z',
        now,
      ),
      { kind: 'expired-identra', purpose: 'connection-invitation' },
    );
    assert.deepEqual(
      parseQrScanValue('identra://credential-presentation?request=request-789', now),
      { kind: 'invalid-identra' },
    );
  });

  it('classifies secure, insecure, and plain-text values', () => {
    assert.deepEqual(parseQrScanValue('https://example.com/path', now), {
      kind: 'url',
      secure: true,
      url: 'https://example.com/path',
    });
    assert.deepEqual(parseQrScanValue('http://example.com', now), {
      kind: 'url',
      secure: false,
      url: 'http://example.com/',
    });
    assert.deepEqual(parseQrScanValue('hello', now), { kind: 'text', value: 'hello' });
  });

  describe('wallet requests', () => {
    const offerUri = 'https://api-identra.awncorp.vn/v1/oid4vci/offers/abc123';
    const requestUri = 'https://verifier.example.vn/oid4vp/requests/r-1';
    const offer = (query) => `openid-credential-offer://?${query}`;
    const request = (query) => `openid4vp://?${query}`;
    const invalid = { kind: 'invalid-wallet-request' };

    it('recognises a credential offer by reference', () => {
      assert.deepEqual(parseQrScanValue(offer(`credential_offer_uri=${encodeURIComponent(offerUri)}`), now), {
        kind: 'credential-offer',
        offerUri,
      });
      // Unencoded is fine as long as the URL carries no & or #.
      assert.deepEqual(parseQrScanValue(`  ${offer(`credential_offer_uri=${offerUri}`)}\n`, now), {
        kind: 'credential-offer',
        offerUri,
      });
    });

    it('recognises a presentation request with client_id and request_uri', () => {
      const clientId = 'x509_hash:Uvo3HtuIxuhC92rShpgqcT3YXwrqRxWEviRiA0OZszk';
      assert.deepEqual(
        parseQrScanValue(request(`client_id=${encodeURIComponent(clientId)}&request_uri=${encodeURIComponent(requestUri)}`), now),
        { kind: 'presentation-request', clientId, requestUri },
      );
      assert.deepEqual(
        parseQrScanValue(request(`request_uri=${encodeURIComponent(requestUri)}&client_id=verifier&request_uri_method=post`), now),
        { kind: 'presentation-request', clientId: 'verifier', requestUri, requestUriMethod: 'post' },
      );
    });

    it('refuses embedded URLs that are not https', () => {
      for (const target of [
        'http://api-identra.awncorp.vn/offer',
        'javascript:alert(1)',
        'data:text/html,hi',
        'file:///etc/passwd',
        'https://user:pass@api-identra.awncorp.vn/offer',
        'https://',
        'HTTPS://api-identra.awncorp.vn/offer',
        'https://api-identra.awncorp.vn/a\nb',
        '',
      ]) {
        assert.deepEqual(parseQrScanValue(offer(`credential_offer_uri=${encodeURIComponent(target)}`), now), invalid, target);
        assert.deepEqual(
          parseQrScanValue(request(`client_id=v&request_uri=${encodeURIComponent(target)}`), now),
          invalid,
          target,
        );
      }
    });

    it('refuses missing, empty, duplicated or unknown parameters', () => {
      const encoded = encodeURIComponent(offerUri);
      for (const value of [
        'openid-credential-offer://',
        'openid-credential-offer://?',
        offer('credential_offer_uri='),
        offer(`credential_offer_uri=${encoded}&credential_offer_uri=${encoded}`),
        // An offer by value next to one by reference is refused, not half-read.
        offer(`credential_offer_uri=${encoded}&credential_offer=${encodeURIComponent('{"credential_issuer":"https://x"}')}`),
        offer(`credential_offer=${encodeURIComponent('{}')}&credential_offer_uri=${encoded}`),
        // By-value offers are not supported: the offer is always fetched by reference.
        offer(`credential_offer=${encodeURIComponent('{"credential_issuer":"https://x"}')}`),
        // Decision: unknown parameters are refused rather than ignored.
        offer(`credential_offer_uri=${encoded}&utm_source=poster`),
        offer(`credential_offer_uri=${encoded}#frag`),
        offer(`=x&credential_offer_uri=${encoded}`),
        offer(`credential_offer_uri=%E0%A4%A`),
        `openid-credential-offer://host/path?credential_offer_uri=${encoded}`,
        request(`request_uri=${encodeURIComponent(requestUri)}`),
        request('client_id=verifier'),
        request(`client_id=&request_uri=${encodeURIComponent(requestUri)}`),
        request(`client_id=a&client_id=b&request_uri=${encodeURIComponent(requestUri)}`),
        request(`client_id=v&request_uri=${encodeURIComponent(requestUri)}&request_uri_method=put`),
        request(`client_id=v&request_uri=${encodeURIComponent(requestUri)}&response_type=vp_token`),
        request(`client_id=${'a'.repeat(513)}&request_uri=${encodeURIComponent(requestUri)}`),
        request(`client_id=a%0Ab&request_uri=${encodeURIComponent(requestUri)}`),
      ]) {
        assert.deepEqual(parseQrScanValue(value, now), invalid, value);
      }
    });

    it('refuses oversized payloads and mixed-case schemes', () => {
      const huge = offer(`credential_offer_uri=${encodeURIComponent(`${offerUri}?pad=${'a'.repeat(10 * 1024)}`)}`);
      assert.deepEqual(parseQrScanValue(huge, now), invalid);
      assert.deepEqual(
        parseQrScanValue(request(`client_id=v&request_uri=${encodeURIComponent(requestUri)}&x=${'a'.repeat(10 * 1024)}`), now),
        invalid,
      );
      // Decision: the wallet schemes are matched case-sensitively; other casings are refused, not treated as text.
      assert.deepEqual(parseQrScanValue(`OPENID-CREDENTIAL-OFFER://?credential_offer_uri=${encodeURIComponent(offerUri)}`, now), invalid);
      assert.deepEqual(parseQrScanValue(`OpenID4VP://?client_id=v&request_uri=${encodeURIComponent(requestUri)}`, now), invalid);
    });

    it("gives the same answers with Expo's runtime URL (whatwg-url-minimum) as with Node's", () => {
      const NodeURL = globalThis.URL;
      const cases = [
        offer(`credential_offer_uri=${encodeURIComponent(offerUri)}`),
        offer(`credential_offer_uri=${encodeURIComponent('https://user:pass@x.example/o')}`),
        offer(`credential_offer_uri=${encodeURIComponent('http://x.example/o')}`),
        request(`client_id=v&request_uri=${encodeURIComponent(requestUri)}`),
        'identra://credential-presentation?request=r&expires=2026-07-23T00%3A03%3A00.000Z',
        'https://example.com/path',
      ];
      const withNode = cases.map((c) => parseQrScanValue(c, now));
      try {
        globalThis.URL = require('whatwg-url-minimum').URL;
        assert.deepEqual(cases.map((c) => parseQrScanValue(c, now)), withNode);
      } finally {
        globalThis.URL = NodeURL;
      }
      assert.equal(withNode[0].kind, 'credential-offer');
      assert.equal(withNode[3].kind, 'presentation-request');
    });

    it('keeps other schemes out of the wallet path', () => {
      assert.deepEqual(parseQrScanValue('openid4vci://?credential_offer_uri=https://x.example/o', now), {
        kind: 'text',
        value: 'openid4vci://?credential_offer_uri=https://x.example/o',
      });
      assert.deepEqual(parseQrScanValue('javascript:alert(1)', now), { kind: 'text', value: 'javascript:alert(1)' });
    });
  });
});
