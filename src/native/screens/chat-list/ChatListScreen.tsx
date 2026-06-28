import { Box, ChevronLeft, Grid2X2, Menu, MessageCircle, Plus, Search, SquarePen, UserRound } from 'lucide-react-native';
import { useEffect, useMemo, useRef, useState } from 'react';
import { FlatList, Keyboard, Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AppBrandLogo } from '../../components/AppLogo';
import { chatConversations, quickContacts } from '../../data/demo/chatDemoData';
import type { ChatPreview } from '../../data/demo/chatDemoData';
import { useI18n } from '../../i18n';
import { IconButton } from '../../components/AppUiPrimitives';
import type { AppColors } from '../../theme';
import {
  ConnectedPersonRow,
  ConversationRow,
  MiniAppRow,
  QuickContact,
  SearchSection,
  SearchTab,
} from './ChatListComponentExports';
import { CreateChatEntryScreen } from './CreateChatEntryScreen';
import { reelsByContact, searchMiniApps, searchPeople } from '../../data/demo/chatListDemoData';
import type { SearchCategory } from './ChatListData';
import { filterChatSearchMiniApps, filterChatSearchPeople, normalizeSearchQuery } from './chatSearchLogic';
import { styles } from './ChatListStyles';
import { ReelsViewerScreen } from './ReelsViewerScreen';
import { ShareThoughtScreen } from './ShareThoughtScreen';
import { ThoughtViewerScreen } from './ThoughtViewerScreen';

type ChatSearchSectionKey = 'people' | 'apps';

export function ChatListScreen({
  colors,
  onOpenConversation,
  onOpenMenu,
}: {
  colors: AppColors;
  onOpenConversation: (conversationId: string) => void;
  onOpenMenu: () => void;
}) {
  const insets = useSafeAreaInsets();
  const { t } = useI18n();
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
  const normalizedQuery = normalizeSearchQuery(query);
  const filteredPeople = useMemo(() => {
    return filterChatSearchPeople(searchPeople, normalizedQuery);
  }, [normalizedQuery]);
  const filteredMiniApps = useMemo(() => {
    return filterChatSearchMiniApps(searchMiniApps, normalizedQuery);
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
  const searchSections = useMemo<ChatSearchSectionKey[]>(() => {
    const sections: ChatSearchSectionKey[] = [];
    if (showPeopleResults) sections.push('people');
    if (showMiniAppResults) sections.push('apps');
    return sections;
  }, [showMiniAppResults, showPeopleResults]);

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
  const renderSearchSection = ({ item }: { item: ChatSearchSectionKey }) => {
    if (item === 'people') {
      return (
        <SearchSection
          colors={colors}
          title={t('chatList.sections.connectedPeople')}
          actionLabel={t('common.seeAll')}
          empty={filteredPeople.length === 0}
          emptyText={t('chatList.empty.people')}
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
      );
    }

    return (
      <SearchSection
        colors={colors}
        title={t('chatList.sections.matchingMiniApps')}
        actionLabel={t('common.seeAll')}
        empty={filteredMiniApps.length === 0}
        emptyText={t('chatList.empty.apps')}
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
    );
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
        <CreateChatEntryScreen
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
          <IconButton colors={colors} label={t('chatList.openMenu')} onPress={onOpenMenu} style={styles.headerAction}>
            <Menu color={colors.text} size={27} strokeWidth={1.9} />
          </IconButton>
          <AppBrandLogo colors={colors} logoSize={28} wordmarkSize={20} style={styles.brand} />
          <View style={styles.headerActions}>
            <IconButton colors={colors} label={t('chatList.shareThought')} onPress={openShareThought} style={styles.headerAction}>
              <SquarePen color={colors.text} size={23} strokeWidth={1.9} />
            </IconButton>
            <IconButton colors={colors} label={t('chatList.createConversation')} onPress={openCreateMode} style={styles.headerAction}>
              <Plus color={colors.text} size={27} strokeWidth={1.8} />
            </IconButton>
          </View>
        </View>

        {searchActive ? (
          <View style={styles.body}>
            <View style={styles.searchArea}>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={t('chatList.backToList')}
                onPress={() => closeSearch()}
                style={styles.searchBackButton}
              >
                <ChevronLeft color={colors.text} size={30} strokeWidth={2.2} />
              </Pressable>

              <View style={[styles.searchBox, styles.searchInputBox, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                <Search color={colors.textSecondary} size={24} strokeWidth={1.9} />
                <TextInput
                  ref={searchInputRef}
                  accessibilityLabel={t('chatList.searchPlaceholder')}
                  onChangeText={setQuery}
                  placeholder={t('chatList.searchPlaceholder')}
                  placeholderTextColor={colors.textSecondary}
                  returnKeyType="search"
                  style={[styles.searchInput, { color: colors.text }]}
                  value={query}
                />
              </View>

              <Pressable
                accessibilityRole="button"
                accessibilityLabel={t('chatList.cancelSearch')}
                onPress={() => closeSearch({ clear: true })}
                style={styles.cancelButton}
              >
                <Text style={[styles.cancelText, { color: colors.primaryDark }]}>{t('common.cancel')}</Text>
              </Pressable>
            </View>

            <View style={[styles.searchTabs, { borderBottomColor: colors.border }]}>
              <SearchTab colors={colors} icon={Grid2X2} label={t('chatList.tabs.all')} active={searchCategory === 'all'} onPress={() => setSearchCategory('all')} />
              <SearchTab colors={colors} icon={UserRound} label={t('chatList.tabs.people')} active={searchCategory === 'people'} onPress={() => setSearchCategory('people')} />
              <SearchTab colors={colors} icon={Box} label={t('chatList.tabs.apps')} active={searchCategory === 'apps'} onPress={() => setSearchCategory('apps')} />
            </View>

            <FlatList
              contentContainerStyle={[styles.searchContent, { paddingBottom: Math.max(insets.bottom, 16) + 16 }]}
              data={searchSections}
              keyboardDismissMode="interactive"
              keyboardShouldPersistTaps="handled"
              keyExtractor={(item) => item}
              renderItem={renderSearchSection}
              showsVerticalScrollIndicator={false}
            />
          </View>
        ) : (
          <FlatList
            style={styles.body}
            contentContainerStyle={[styles.content, { paddingBottom: Math.max(insets.bottom, 8) }]}
            data={chatConversations}
            keyExtractor={(conversation) => conversation.id}
            keyboardShouldPersistTaps="handled"
            renderItem={({ item: conversation }) => (
              <ConversationRow
                colors={colors}
                conversation={conversation}
                onPress={() => onOpenConversation(conversation.id)}
              />
            )}
            showsVerticalScrollIndicator={false}
            ListHeaderComponent={
              <>
                <View style={styles.searchArea}>
                  <Pressable
                    accessibilityRole="search"
                    accessibilityLabel={t('chatList.openSearch')}
                    onPress={openSearch}
                    style={styles.searchInputPressable}
                  >
                    <View style={[styles.searchBox, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                      <Search color={colors.textSecondary} size={24} strokeWidth={1.9} />
                      <Text style={[styles.searchPlaceholder, { color: colors.textSecondary }]}>
                        {t('chatList.searchPlaceholder')}
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

                {chatConversations.length ? <View style={styles.conversationList} /> : null}
              </>
            }
            ListEmptyComponent={
              <View style={[styles.conversationList, styles.emptyState]}>
                <View style={[styles.emptyIcon, { backgroundColor: colors.surfaceMuted }]}>
                  <MessageCircle color={colors.primaryDark} size={30} strokeWidth={1.9} />
                </View>
                <Text style={[styles.emptyTitle, { color: colors.text }]}>{t('chatList.empty.conversationsTitle')}</Text>
                <Text style={[styles.emptyDescription, { color: colors.textSecondary }]}>
                  {t('chatList.empty.conversationsDescription')}
                </Text>
              </View>
            }
          />
        )}

      </View>
    </View>
  );
}
