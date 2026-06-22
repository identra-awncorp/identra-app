import { Box, ChevronLeft, Grid2X2, MessageCircle, Plus, Search, SquarePen, UserRound } from 'lucide-react-native';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Keyboard, Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AppBrandLogo } from '../components/AppLogo';
import { chatConversations, quickContacts } from '../data/chatDemoData';
import type { ChatPreview } from '../data/chatDemoData';
import { IconButton } from '../components/ui';
import type { AppColors } from '../theme';
import {
  ChatListBottomMenu,
  ConnectedPersonRow,
  ConversationRow,
  MiniAppRow,
  QuickContact,
  SearchSection,
  SearchTab,
} from './chat-list/ChatListParts';
import { CreateNewScreen } from './chat-list/CreateNewScreen';
import { reelsByContact, searchMiniApps, searchPeople, type SearchCategory } from './chat-list/ChatListData';
import { styles } from './chat-list/ChatListStyles';
import { ReelsViewerScreen } from './chat-list/ReelsViewerScreen';
import { ShareThoughtScreen } from './chat-list/ShareThoughtScreen';
import { ThoughtViewerScreen } from './chat-list/ThoughtViewerScreen';

export function ChatListScreen({
  colors,
  onOpenFeed,
  onOpenIDPay,
  onOpenConversation,
  onOpenProfile,
  onOpenScan,
}: {
  colors: AppColors;
  onOpenFeed: () => void;
  onOpenIDPay: () => void;
  onOpenConversation: (conversationId: string) => void;
  onOpenProfile: () => void;
  onOpenScan: () => void;
}) {
  const insets = useSafeAreaInsets();
  const [query, setQuery] = useState('');
  const [searchActive, setSearchActive] = useState(false);
  const [searchCategory, setSearchCategory] = useState<SearchCategory>('all');
  const [createModeOpen, setCreateModeOpen] = useState(false);
  const [shareThoughtOpen, setShareThoughtOpen] = useState(false);
  const [thoughtDraft, setThoughtDraft] = useState('');
  const [sharedThought, setSharedThought] = useState('');
  const [activeReelContact, setActiveReelContact] = useState<ChatPreview | null>(null);
  const [activeReelIndex, setActiveReelIndex] = useState(0);
  const [activeThoughtContact, setActiveThoughtContact] = useState<ChatPreview | null>(null);
  const searchInputRef = useRef<TextInput>(null);
  const normalizedQuery = query.trim().toLocaleLowerCase('vi-VN');
  const filteredPeople = useMemo(() => {
    if (!normalizedQuery) return searchPeople;
    return searchPeople.filter((item) =>
      `${item.name} ${item.handle}`.toLocaleLowerCase('vi-VN').includes(normalizedQuery),
    );
  }, [normalizedQuery]);
  const filteredMiniApps = useMemo(() => {
    if (!normalizedQuery) return searchMiniApps;
    return searchMiniApps.filter((item) =>
      `${item.name} ${item.category} ${item.description}`.toLocaleLowerCase('vi-VN').includes(normalizedQuery),
    );
  }, [normalizedQuery]);
  const showPeopleResults = searchCategory === 'all' || searchCategory === 'people';
  const showMiniAppResults = searchCategory === 'all' || searchCategory === 'apps';
  const activeReels = activeReelContact ? reelsByContact[activeReelContact.id] ?? [] : [];
  const displayedQuickContacts = useMemo(() => {
    if (!sharedThought.trim()) return quickContacts;
    return quickContacts.map((contact) =>
      contact.id === 'story'
        ? {
            ...contact,
            thought: sharedThought,
            thoughtBackgroundColor: '#FFFFFF',
            thoughtTextColor: '#11172F',
            hasNewPost: true,
          }
        : contact,
    );
  }, [sharedThought]);

  useEffect(() => {
    if (!searchActive) return undefined;

    const focusFrame = requestAnimationFrame(() => searchInputRef.current?.focus());
    return () => cancelAnimationFrame(focusFrame);
  }, [searchActive]);

  const openSearch = () => {
    setSearchActive(true);
  };
  const closeSearch = ({ clear = false } = {}) => {
    Keyboard.dismiss();
    if (clear) setQuery('');
    setSearchActive(false);
  };
  const openCreateMode = () => {
    Keyboard.dismiss();
    setCreateModeOpen(true);
  };
  const closeCreateMode = () => {
    setCreateModeOpen(false);
  };
  const openShareThought = () => {
    Keyboard.dismiss();
    setShareThoughtOpen(true);
  };
  const closeShareThought = () => {
    Keyboard.dismiss();
    setShareThoughtOpen(false);
  };
  const submitThought = () => {
    Keyboard.dismiss();
    const trimmedThought = thoughtDraft.trim();
    if (trimmedThought) {
      setSharedThought(trimmedThought);
    }
    setShareThoughtOpen(false);
  };
  const handleQuickContactPress = (contact: ChatPreview) => {
    if (contact.id === 'story') {
      openShareThought();
      return;
    }

    const contactReels = reelsByContact[contact.id];
    if (contact.hasNewPost && contactReels?.length) {
      Keyboard.dismiss();
      setActiveReelContact(contact);
      setActiveReelIndex(0);
      return;
    }

    onOpenConversation(contact.id);
  };
  const handleThoughtBubblePress = (contact: ChatPreview) => {
    if (contact.id === 'story' && !sharedThought.trim()) {
      openShareThought();
      return;
    }

    setActiveThoughtContact(contact);
  };
  const closeThoughtViewer = () => {
    setActiveThoughtContact(null);
  };
  const closeReels = () => {
    setActiveReelContact(null);
    setActiveReelIndex(0);
  };
  const showNextReel = () => {
    if (activeReelIndex >= activeReels.length - 1) {
      closeReels();
      return;
    }
    setActiveReelIndex((index) => index + 1);
  };
  const showPreviousReel = () => {
    setActiveReelIndex((index) => Math.max(0, index - 1));
  };

  if (activeThoughtContact) {
    return (
      <View
        nativeID="screen-thought-viewer"
        testID="screen-thought-viewer"
        style={[styles.screen, { backgroundColor: colors.background }]}
      >
        <ThoughtViewerScreen
          bottomInset={insets.bottom}
          colors={colors}
          contact={activeThoughtContact}
          onClose={closeThoughtViewer}
          topInset={insets.top}
        />
      </View>
    );
  }

  if (activeReelContact && activeReels.length) {
    return (
      <View
        nativeID="screen-reels-viewer"
        testID="screen-reels-viewer"
        style={styles.reelsRoot}
      >
        <ReelsViewerScreen
          activeIndex={activeReelIndex}
          bottomInset={insets.bottom}
          contact={activeReelContact}
          onClose={closeReels}
          onNext={showNextReel}
          onPrevious={showPreviousReel}
          reels={activeReels}
          topInset={insets.top}
        />
      </View>
    );
  }

  if (shareThoughtOpen) {
    return (
      <View
        nativeID="screen-share-thought"
        testID="screen-share-thought"
        style={[styles.screen, { backgroundColor: colors.background }]}
      >
        <ShareThoughtScreen
          bottomInset={insets.bottom}
          colors={colors}
          onChangeThought={setThoughtDraft}
          onClose={closeShareThought}
          onSubmit={submitThought}
          thought={thoughtDraft}
        />
      </View>
    );
  }

  if (createModeOpen) {
    return (
      <View
        nativeID="screen-chat-list-create"
        testID="screen-chat-list-create"
        style={[styles.screen, { backgroundColor: colors.background }]}
      >
        <CreateNewScreen
          colors={colors}
          bottomInset={insets.bottom}
          onClose={closeCreateMode}
          onOpenConversation={onOpenConversation}
        />
      </View>
    );
  }

  return (
    <View
      nativeID="screen-chat-list"
      testID="screen-chat-list"
      style={[styles.screen, { backgroundColor: colors.background }]}
    >
      <View pointerEvents="auto" style={styles.defaultLayer}>
        <View style={styles.header}>
          <AppBrandLogo colors={colors} logoSize={28} wordmarkSize={20} style={styles.brand} />
          <View style={styles.headerActions}>
            <IconButton colors={colors} label="Chia sẻ suy nghĩ" onPress={openShareThought} style={styles.headerAction}>
              <SquarePen color={colors.text} size={23} strokeWidth={1.9} />
            </IconButton>
            <IconButton colors={colors} label="Tạo cuộc trò chuyện" onPress={openCreateMode} style={styles.headerAction}>
              <Plus color={colors.text} size={27} strokeWidth={1.8} />
            </IconButton>
          </View>
        </View>

        {searchActive ? (
          <View style={styles.body}>
            <View style={styles.searchArea}>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Quay lại danh sách trò chuyện"
                onPress={() => closeSearch()}
                style={styles.searchBackButton}
              >
                <ChevronLeft color={colors.text} size={30} strokeWidth={2.2} />
              </Pressable>

              <View style={[styles.searchBox, styles.searchInputBox, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                <Search color={colors.textSecondary} size={24} strokeWidth={1.9} />
                <TextInput
                  ref={searchInputRef}
                  accessibilityLabel="Tìm người, số điện thoại hoặc mini app"
                  onChangeText={setQuery}
                  placeholder="Tìm người, số điện thoại hoặc mini app"
                  placeholderTextColor={colors.textSecondary}
                  returnKeyType="search"
                  style={[styles.searchInput, { color: colors.text }]}
                  value={query}
                />
              </View>

              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Hủy tìm kiếm"
                onPress={() => closeSearch({ clear: true })}
                style={styles.cancelButton}
              >
                <Text style={[styles.cancelText, { color: colors.primaryDark }]}>Hủy</Text>
              </Pressable>
            </View>

            <View style={[styles.searchTabs, { borderBottomColor: colors.border }]}>
              <SearchTab colors={colors} icon={Grid2X2} label="Tất cả" active={searchCategory === 'all'} onPress={() => setSearchCategory('all')} />
              <SearchTab colors={colors} icon={UserRound} label="Người" active={searchCategory === 'people'} onPress={() => setSearchCategory('people')} />
              <SearchTab colors={colors} icon={Box} label="Mini app" active={searchCategory === 'apps'} onPress={() => setSearchCategory('apps')} />
            </View>

            <ScrollView
              contentContainerStyle={[styles.searchContent, { paddingBottom: Math.max(insets.bottom, 16) + 16 }]}
              keyboardDismissMode="interactive"
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
            >
              {showPeopleResults ? (
                <SearchSection
                  colors={colors}
                  title="Người đã kết nối"
                  actionLabel="Xem tất cả"
                  empty={filteredPeople.length === 0}
                  emptyText="Không tìm thấy người phù hợp."
                >
                  <View style={[styles.searchCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                    {filteredPeople.map((person, index) => (
                      <ConnectedPersonRow
                        key={person.id}
                        colors={colors}
                        person={person}
                        showDivider={index < filteredPeople.length - 1}
                      />
                    ))}
                  </View>
                </SearchSection>
              ) : null}

              {showMiniAppResults ? (
                <SearchSection
                  colors={colors}
                  title="Mini app phù hợp"
                  actionLabel="Xem tất cả"
                  empty={filteredMiniApps.length === 0}
                  emptyText="Không tìm thấy mini app phù hợp."
                >
                  <View style={[styles.searchCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                    {filteredMiniApps.map((app, index) => (
                      <MiniAppRow
                        key={app.id}
                        app={app}
                        colors={colors}
                        showDivider={index < filteredMiniApps.length - 1}
                      />
                    ))}
                  </View>
                </SearchSection>
              ) : null}
            </ScrollView>
          </View>
        ) : (
          <ScrollView
            style={styles.body}
            contentContainerStyle={[styles.content, { paddingBottom: Math.max(insets.bottom, 8) }]}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.searchArea}>
              <Pressable
                accessibilityRole="search"
                accessibilityLabel="Mở tìm kiếm"
                onPress={openSearch}
                style={styles.searchInputPressable}
              >
                <View style={[styles.searchBox, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                  <Search color={colors.textSecondary} size={24} strokeWidth={1.9} />
                  <Text style={[styles.searchPlaceholder, { color: colors.textSecondary }]}>
                    Tìm người, số điện thoại hoặc mini app
                  </Text>
                </View>
              </Pressable>
            </View>

            <ScrollView
              contentContainerStyle={styles.quickContacts}
              horizontal
              style={styles.quickContactsScroll}
              showsHorizontalScrollIndicator={false}
            >
              {displayedQuickContacts.map((contact) => (
                <QuickContact
                  key={contact.id}
                  colors={colors}
                  contact={contact}
                  onAvatarPress={handleQuickContactPress}
                  onThoughtPress={handleThoughtBubblePress}
                />
              ))}
            </ScrollView>

            <View style={styles.conversationList}>
              {chatConversations.map((conversation) => (
                <ConversationRow
                  key={conversation.id}
                  colors={colors}
                  conversation={conversation}
                  onPress={() => onOpenConversation(conversation.id)}
                />
              ))}
              {chatConversations.length === 0 ? (
                <View style={styles.emptyState}>
                  <View style={[styles.emptyIcon, { backgroundColor: colors.surfaceMuted }]}>
                    <MessageCircle color={colors.primaryDark} size={30} strokeWidth={1.9} />
                  </View>
                  <Text style={[styles.emptyTitle, { color: colors.text }]}>Chưa có trò chuyện</Text>
                  <Text style={[styles.emptyDescription, { color: colors.textSecondary }]}>
                    Bắt đầu kết nối SSI hoặc tạo cuộc trò chuyện mới để trao đổi an toàn.
                  </Text>
                </View>
              ) : null}
            </View>
          </ScrollView>
        )}

        {searchActive ? null : (
          <ChatListBottomMenu
            bottomInset={insets.bottom}
            colors={colors}
            onOpenFeed={onOpenFeed}
            onOpenIDPay={onOpenIDPay}
            onOpenProfile={onOpenProfile}
            onOpenScan={onOpenScan}
          />
        )}
      </View>
    </View>
  );
}
