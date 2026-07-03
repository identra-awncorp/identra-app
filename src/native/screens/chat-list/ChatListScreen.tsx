import { Box, ChevronLeft, Grid2X2, MessageCircle, Plus, Search, SquarePen, UserRound } from 'lucide-react-native';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { FlatList, Keyboard, Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { chatConversations, quickContacts } from '../../data/demo/chatDemoData';
import type { ChatPreview } from '../../data/demo/chatDemoData';
import { useI18n } from '../../i18n';
import { MainTopHeader } from '../../components/MainTopHeader';
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

const conversationKeyExtractor = (conversation: ChatPreview) => conversation.id;
const searchSectionKeyExtractor = (item: ChatSearchSectionKey) => item;

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
  const activeReels = useMemo(
    () => (activeReelContact ? reelsByContact[activeReelContact.id] ?? [] : []),
    [activeReelContact],
  );
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

  const openSearch = useCallback(() => {
    setSearchActive(true);
  }, []);
  const closeSearch = useCallback(({ clear = false }: { clear?: boolean } = {}) => {
    Keyboard.dismiss();
    if (clear) setQuery('');
    setSearchActive(false);
  }, []);
  const closeSearchPanel = useCallback(() => {
    closeSearch();
  }, [closeSearch]);
  const cancelSearch = useCallback(() => {
    closeSearch({ clear: true });
  }, [closeSearch]);
  const showAllSearchResults = useCallback(() => {
    setSearchCategory('all');
  }, []);
  const showPeopleSearchResults = useCallback(() => {
    setSearchCategory('people');
  }, []);
  const showAppSearchResults = useCallback(() => {
    setSearchCategory('apps');
  }, []);
  const openCreateMode = useCallback(() => {
    Keyboard.dismiss();
    setCreateModeOpen(true);
  }, []);
  const closeCreateMode = useCallback(() => {
    setCreateModeOpen(false);
  }, []);
  const openShareThought = useCallback(() => {
    Keyboard.dismiss();
    setShareThoughtOpen(true);
  }, []);
  const closeShareThought = useCallback(() => {
    Keyboard.dismiss();
    setShareThoughtOpen(false);
  }, []);
  const submitThought = useCallback(() => {
    Keyboard.dismiss();
    const trimmedThought = thoughtDraft.trim();
    if (trimmedThought) {
      setSharedThought(trimmedThought);
    }
    setShareThoughtOpen(false);
  }, [thoughtDraft]);
  const handleQuickContactPress = useCallback((contact: ChatPreview) => {
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
  }, [onOpenConversation, openShareThought]);
  const handleThoughtBubblePress = useCallback((contact: ChatPreview) => {
    if (contact.id === 'story' && !sharedThought.trim()) {
      openShareThought();
      return;
    }

    setActiveThoughtContact(contact);
  }, [openShareThought, sharedThought]);
  const closeThoughtViewer = useCallback(() => {
    setActiveThoughtContact(null);
  }, []);
  const closeReels = useCallback(() => {
    setActiveReelContact(null);
    setActiveReelIndex(0);
  }, []);
  const renderSearchSection = useCallback(({ item }: { item: ChatSearchSectionKey }) => {
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
  }, [colors, filteredMiniApps, filteredPeople, t]);
  const showNextReel = useCallback(() => {
    if (activeReelIndex >= activeReels.length - 1) {
      closeReels();
      return;
    }
    setActiveReelIndex((index) => index + 1);
  }, [activeReelIndex, activeReels.length, closeReels]);
  const showPreviousReel = useCallback(() => {
    setActiveReelIndex((index) => Math.max(0, index - 1));
  }, []);
  const headerActions = useMemo(
    () => [
      {
        key: 'share-thought',
        label: t('chatList.shareThought'),
        icon: SquarePen,
        onPress: openShareThought,
      },
      {
        key: 'create-conversation',
        label: t('chatList.createConversation'),
        icon: Plus,
        onPress: openCreateMode,
      },
    ],
    [openCreateMode, openShareThought, t],
  );
  const searchTabs = useMemo(
    () => (
      <View style={[styles.searchTabs, { borderBottomColor: colors.border }]}>
        <SearchTab
          active={searchCategory === 'all'}
          colors={colors}
          icon={Grid2X2}
          label={t('chatList.tabs.all')}
          onPress={showAllSearchResults}
        />
        <SearchTab
          active={searchCategory === 'people'}
          colors={colors}
          icon={UserRound}
          label={t('chatList.tabs.people')}
          onPress={showPeopleSearchResults}
        />
        <SearchTab
          active={searchCategory === 'apps'}
          colors={colors}
          icon={Box}
          label={t('chatList.tabs.apps')}
          onPress={showAppSearchResults}
        />
      </View>
    ),
    [colors, searchCategory, showAllSearchResults, showAppSearchResults, showPeopleSearchResults, t],
  );
  const searchContentContainerStyle = useMemo(
    () => [styles.searchContent, { paddingBottom: Math.max(insets.bottom, 16) + 16 }],
    [insets.bottom],
  );
  const conversationContentContainerStyle = useMemo(
    () => [styles.content, { paddingBottom: Math.max(insets.bottom, 8) }],
    [insets.bottom],
  );
  const chatListHeader = useMemo(
    () => (
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
    ),
    [colors, displayedQuickContacts, handleQuickContactPress, handleThoughtBubblePress, openSearch, t],
  );
  const emptyListComponent = useMemo(
    () => (
      <View style={[styles.conversationList, styles.emptyState]}>
        <View style={[styles.emptyIcon, { backgroundColor: colors.surfaceMuted }]}>
          <MessageCircle color={colors.primaryDark} size={30} strokeWidth={1.9} />
        </View>
        <Text style={[styles.emptyTitle, { color: colors.text }]}>{t('chatList.empty.conversationsTitle')}</Text>
        <Text style={[styles.emptyDescription, { color: colors.textSecondary }]}>
          {t('chatList.empty.conversationsDescription')}
        </Text>
      </View>
    ),
    [colors, t],
  );
  const renderConversationItem = useCallback(
    ({ item: conversation }: { item: ChatPreview }) => (
      <ConversationRow
        colors={colors}
        conversation={conversation}
        onOpenConversation={onOpenConversation}
      />
    ),
    [colors, onOpenConversation],
  );

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
          topInset={insets.top}
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
          topInset={insets.top}
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
        <MainTopHeader
          colors={colors}
          menuLabel={t('chatList.openMenu')}
          onOpenMenu={onOpenMenu}
          actions={headerActions}
        />

        {searchActive ? (
          <View style={styles.body}>
            <View style={styles.searchArea}>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={t('chatList.backToList')}
                onPress={closeSearchPanel}
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
                onPress={cancelSearch}
                style={styles.cancelButton}
              >
                <Text style={[styles.cancelText, { color: colors.primaryDark }]}>{t('common.cancel')}</Text>
              </Pressable>
            </View>

            {searchTabs}

            <FlatList
              contentContainerStyle={searchContentContainerStyle}
              data={searchSections}
              initialNumToRender={2}
              keyboardDismissMode="interactive"
              keyboardShouldPersistTaps="handled"
              keyExtractor={searchSectionKeyExtractor}
              maxToRenderPerBatch={2}
              removeClippedSubviews
              renderItem={renderSearchSection}
              showsVerticalScrollIndicator={false}
              updateCellsBatchingPeriod={50}
              windowSize={3}
            />
          </View>
        ) : (
          <FlatList
            style={styles.body}
            contentContainerStyle={conversationContentContainerStyle}
            data={chatConversations}
            initialNumToRender={8}
            keyExtractor={conversationKeyExtractor}
            keyboardShouldPersistTaps="handled"
            maxToRenderPerBatch={8}
            removeClippedSubviews
            renderItem={renderConversationItem}
            showsVerticalScrollIndicator={false}
            updateCellsBatchingPeriod={50}
            windowSize={7}
            ListHeaderComponent={chatListHeader}
            ListEmptyComponent={emptyListComponent}
          />
        )}

      </View>
    </View>
  );
}
