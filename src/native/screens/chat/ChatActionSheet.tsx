import { useEffect, useRef, useState } from 'react';
import {
  Alert,
  Animated,
  Easing,
  Modal,
  PanResponder,
  Platform,
  Pressable,
  StyleSheet,
  useWindowDimensions,
  View,
} from 'react-native';
import type { AppColors } from '../../theme';
import { radius, spacing } from '../../theme';
import { useI18n } from '../../i18n';
import { ChatActionMenu } from './ChatActionMenu';
import { AddBankAccountSheet, BankAccountSheet } from './action-sheets/BankAccountActionSheets';
import { ContractSetupSheet } from './action-sheets/ContractSetupSheet';
import { PaymentQrSheet } from './action-sheets/PaymentQrSheet';
import { ReminderSheet } from './action-sheets/ReminderSheet';
import { DirectTransferSheet, TransferConfirmationSheet } from './action-sheets/DirectTransferSheets';
import { formatAmount, type TransferDraft } from './paymentUtils';

type ActionSheetMode =
  | 'actions'
  | 'contract'
  | 'payment-qr'
  | 'transfer'
  | 'transfer-confirm'
  | 'reminder'
  | 'bank-account'
  | 'add-bank-account';
type ExpandedActionSheetMode = Exclude<ActionSheetMode, 'actions'>;
const COLLAPSED_SHEET_HEIGHT = 445;

export function ChatActionSheet({
  colors,
  onClose,
  visible,
}: {
  colors: AppColors;
  onClose: () => void;
  visible: boolean;
}) {
  const { t } = useI18n();
  const { height: windowHeight } = useWindowDimensions();
  const [actionSheetMode, setActionSheetMode] = useState<ActionSheetMode>('actions');
  const [pendingTransfer, setPendingTransfer] = useState<TransferDraft | null>(null);
  const sheetTranslateY = useRef(new Animated.Value(520)).current;
  const sheetExpansion = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!visible) return;

    sheetTranslateY.setValue(520);
    Animated.timing(sheetTranslateY, {
      duration: 260,
      easing: Easing.out(Easing.cubic),
      toValue: 0,
      useNativeDriver: true,
    }).start();
  }, [sheetTranslateY, visible]);

  const openExpandedSheet = (mode: ExpandedActionSheetMode) => {
    setActionSheetMode(mode);
    Animated.timing(sheetExpansion, {
      duration: 320,
      easing: Easing.out(Easing.cubic),
      toValue: 1,
      useNativeDriver: false,
    }).start();
  };

  const openContractSetup = () => openExpandedSheet('contract');
  const openPaymentQr = () => openExpandedSheet('payment-qr');
  const openTransfer = () => openExpandedSheet('transfer');
  const openReminder = () => openExpandedSheet('reminder');
  const openBankAccount = () => openExpandedSheet('bank-account');

  const closeActionSheet = (onClosed?: () => void) => {
    Animated.timing(sheetTranslateY, {
      duration: 210,
      easing: Easing.in(Easing.cubic),
      toValue: actionSheetMode === 'actions' ? 520 : windowHeight,
      useNativeDriver: true,
    }).start(() => {
      setActionSheetMode('actions');
      setPendingTransfer(null);
      sheetExpansion.setValue(0);
      onClose();
      onClosed?.();
    });
  };

  const handleAction = (title: string, description: string) => {
    closeActionSheet(() => Alert.alert(title, description));
  };

  const sheetPanResponder = PanResponder.create({
    onMoveShouldSetPanResponder: (_, gestureState) =>
      actionSheetMode === 'actions' && gestureState.dy > 6 && Math.abs(gestureState.dy) > Math.abs(gestureState.dx),
    onPanResponderMove: (_, gestureState) => {
      sheetTranslateY.setValue(Math.max(0, gestureState.dy));
    },
    onPanResponderRelease: (_, gestureState) => {
      if (gestureState.dy > 110 || gestureState.vy > 0.75) {
        closeActionSheet();
        return;
      }

      Animated.spring(sheetTranslateY, {
        damping: 24,
        stiffness: 240,
        toValue: 0,
        useNativeDriver: true,
      }).start();
    },
    onPanResponderTerminate: () => {
      Animated.spring(sheetTranslateY, {
        damping: 24,
        stiffness: 240,
        toValue: 0,
        useNativeDriver: true,
      }).start();
    },
  });
  const expandedSheetHeight = Math.max(COLLAPSED_SHEET_HEIGHT, windowHeight);
  const sheetCollapsedOffset = Math.max(0, expandedSheetHeight - COLLAPSED_SHEET_HEIGHT);
  const actionSheetExpandTranslateY = sheetExpansion.interpolate({
    inputRange: [0, 1],
    outputRange: [sheetCollapsedOffset, 0],
  });
  const actionSheetRadius = sheetExpansion.interpolate({
    inputRange: [0, 1],
    outputRange: [30, 0],
  });

  return (
    <Modal
      animationType="none"
      navigationBarTranslucent
      onRequestClose={() => closeActionSheet()}
      statusBarTranslucent
      transparent
      visible={visible}
    >
      <View style={styles.actionSheetOverlay}>
        <Pressable
          accessibilityLabel={t('chat.common.closeActionSheet')}
          accessibilityRole="button"
          onPress={() => closeActionSheet()}
          style={StyleSheet.absoluteFill}
        />
        <Animated.View
          {...sheetPanResponder.panHandlers}
          style={[
            styles.actionSheetMotion,
            {
              height: actionSheetMode === 'actions' ? COLLAPSED_SHEET_HEIGHT : expandedSheetHeight,
              transform: [{ translateY: sheetTranslateY }],
            },
          ]}
        >
          <Animated.View
            nativeID="screen-chat-action-sheet"
            testID="screen-chat-action-sheet"
            style={[
              styles.actionSheet,
              {
                backgroundColor: colors.surface,
                borderTopLeftRadius: actionSheetRadius,
                borderTopRightRadius: actionSheetRadius,
                height: actionSheetMode === 'actions' ? COLLAPSED_SHEET_HEIGHT : expandedSheetHeight,
                transform: actionSheetMode === 'actions' ? [{ translateY: 0 }] : [{ translateY: actionSheetExpandTranslateY }],
              },
            ]}
          >
            {actionSheetMode === 'actions' ? <View style={[styles.actionSheetHandle, { backgroundColor: colors.border }]} /> : null}
            {actionSheetMode === 'contract' ? (
                <ContractSetupSheet
                  colors={colors}
                  onCancel={() => closeActionSheet()}
                  onCreate={() => closeActionSheet(() => Alert.alert(t('chat.actionSheet.contractCreatedTitle'), t('chat.actionSheet.contractCreatedDescription')))}
                />
              ) : actionSheetMode === 'payment-qr' ? (
                <PaymentQrSheet
                  colors={colors}
                  onCancel={() => closeActionSheet()}
                  onShare={() => Alert.alert(t('chat.actionSheet.qrShareTitle'), t('chat.actionSheet.qrShareDescription'))}
                />
              ) : actionSheetMode === 'transfer' ? (
                <DirectTransferSheet
                  colors={colors}
                  initialTransfer={pendingTransfer}
                  onCancel={() => closeActionSheet()}
                  onTransfer={(amount, unit, note) => {
                    setPendingTransfer({ amount, unit, note });
                    setActionSheetMode('transfer-confirm');
                  }}
                />
              ) : actionSheetMode === 'transfer-confirm' && pendingTransfer ? (
                <TransferConfirmationSheet
                  colors={colors}
                  note={pendingTransfer.note}
                  onBack={() => setActionSheetMode('transfer')}
                  onCancel={() => closeActionSheet()}
                  onConfirm={() => closeActionSheet(() => Alert.alert(
                    t('chat.actionSheet.transferSuccessTitle'),
                    t('chat.actionSheet.transferSuccessDescription', { amount: formatAmount(pendingTransfer.amount), unit: pendingTransfer.unit }),
                  ))}
                  rawAmount={pendingTransfer.amount}
                  unit={pendingTransfer.unit}
                />
              ) : actionSheetMode === 'reminder' ? (
                <ReminderSheet
                  colors={colors}
                  onCancel={() => closeActionSheet()}
                  onCreate={(title) => closeActionSheet(() => Alert.alert(
                    t('chat.actionSheet.reminderCreatedTitle'),
                    t('chat.actionSheet.reminderCreatedDescription', { title }),
                  ))}
                />
              ) : actionSheetMode === 'bank-account' ? (
                <BankAccountSheet
                  colors={colors}
                  onAdd={() => setActionSheetMode('add-bank-account')}
                  onCancel={() => closeActionSheet()}
                  onShare={(bank) => closeActionSheet(() => Alert.alert(
                    t('chat.actionSheet.bankSharedTitle'),
                    t('chat.actionSheet.bankSharedDescription', { bank }),
                  ))}
                />
              ) : actionSheetMode === 'add-bank-account' ? (
                <AddBankAccountSheet
                  colors={colors}
                  onBack={() => setActionSheetMode('bank-account')}
                  onSave={(bank) => {
                    Alert.alert(t('chat.actionSheet.bankSavedTitle'), t('chat.actionSheet.bankSavedDescription', { bank }));
                    setActionSheetMode('bank-account');
                  }}
                />
              ) : (
                <ChatActionMenu
                  colors={colors}
                  onOpenBankAccount={openBankAccount}
                  onOpenContract={openContractSetup}
                  onOpenPaymentQr={openPaymentQr}
                  onOpenReminder={openReminder}
                  onOpenTransfer={openTransfer}
                  onShareCredential={() => handleAction(t('chat.menu.credentialTitle'), t('chat.menu.credentialDescription'))}
                />
            )}
          </Animated.View>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  actionSheetOverlay: { backgroundColor: 'rgba(12, 20, 45, 0.32)', flex: 1, justifyContent: 'flex-end' },
  actionSheetMotion: { width: '100%' },
  actionSheet: { minHeight: COLLAPSED_SHEET_HEIGHT, overflow: 'hidden', paddingBottom: Platform.OS === 'ios' ? 30 : spacing.lg, paddingHorizontal: spacing.sm + spacing.xs, paddingTop: spacing.md - spacing.xxs },
  actionSheetHandle: { alignSelf: 'center', borderRadius: radius.round, height: 5, marginBottom: spacing.lg - spacing.sm + spacing.xxs, opacity: 0.85, width: 52 },
});
