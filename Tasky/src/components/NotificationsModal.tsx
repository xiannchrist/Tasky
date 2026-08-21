import React from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
  TouchableWithoutFeedback,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTasks } from '../context/TaskContext';
import { Colors } from '../constants/colors';
import { formatDateTime } from '../utils/dateUtils';

interface NotificationsModalProps {
  visible: boolean;
  onClose: () => void;
}

export const NotificationsModal: React.FC<NotificationsModalProps> = ({
  visible,
  onClose,
}) => {
  const { notificationsList, settings } = useTasks();

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.overlay}>
          <TouchableWithoutFeedback>
            <View style={[styles.modalCard, Colors.shadow.lg]}>
              {/* Header */}
              <View style={styles.header}>
                <View style={styles.headerLeft}>
                  <View style={styles.iconCircle}>
                    <Ionicons name="notifications" size={18} color={Colors.primary} />
                  </View>
                  <View>
                    <Text style={styles.title}>Notifications ({notificationsList.length})</Text>
                    <Text style={styles.subtitle}>
                      {settings.notificationsEnabled ? 'Active deadline alerts' : 'Notifications paused'}
                    </Text>
                  </View>
                </View>
                <Pressable onPress={onClose} hitSlop={10} style={styles.closeBtn}>
                  <Ionicons name="close" size={20} color={Colors.textSecondary} />
                </Pressable>
              </View>

              {/* Scrollable Notification Items List */}
              <ScrollView
                style={styles.listScroll}
                contentContainerStyle={styles.listContent}
                showsVerticalScrollIndicator={true}
                nestedScrollEnabled={true}
                keyboardShouldPersistTaps="handled"
              >
                {notificationsList.length === 0 ? (
                  <View style={styles.emptyBox}>
                    <Ionicons name="mail-open-outline" size={38} color={Colors.textMuted} />
                    <Text style={styles.emptyTitle}>No New Notifications</Text>
                    <Text style={styles.emptySubtitle}>
                      When tasks are assigned or deadlines approach, Tasky will alert you here!
                    </Text>
                  </View>
                ) : (
                  notificationsList.map((item) => (
                    <View key={item.id} style={styles.notifCard}>
                      <View style={styles.notifTopRow}>
                        <Text style={styles.notifTitle}>{item.title}</Text>
                        {item.subjectName && (
                          <View style={styles.subjectBadge}>
                            <Text style={styles.subjectBadgeText}>{item.subjectName}</Text>
                          </View>
                        )}
                      </View>
                      <Text style={styles.notifMessage}>{item.message}</Text>
                      <View style={styles.notifFooter}>
                        <Ionicons name="time-outline" size={12} color={Colors.textMuted} />
                        <Text style={styles.notifTime}>
                          {formatDateTime(item.timestamp)}
                        </Text>
                      </View>
                    </View>
                  ))
                )}
              </ScrollView>

              {/* Fixed Bottom Close Button */}
              <View style={styles.footerContainer}>
                <Pressable
                  onPress={onClose}
                  style={({ pressed }) => [
                    styles.dismissButton,
                    pressed && { opacity: 0.85 },
                  ]}
                >
                  <Text style={styles.dismissText}>Close</Text>
                </Pressable>
              </View>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  modalCard: {
    backgroundColor: Colors.card,
    borderRadius: 22,
    width: '100%',
    maxWidth: 440,
    maxHeight: '85%',
    padding: 18,
    display: 'flex',
    flexDirection: 'column',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconCircle: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: Colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  subtitle: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 1,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.cardAlt,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listScroll: {
    flexShrink: 1,
    maxHeight: 380,
  },
  listContent: {
    paddingVertical: 6,
    paddingBottom: 12,
  },
  emptyBox: {
    alignItems: 'center',
    paddingVertical: 36,
  },
  emptyTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginTop: 8,
  },
  emptySubtitle: {
    fontSize: 13,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginTop: 4,
    lineHeight: 18,
    paddingHorizontal: 16,
  },
  notifCard: {
    backgroundColor: Colors.cardAlt,
    borderRadius: 12,
    padding: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  notifTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  notifTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.textPrimary,
    flex: 1,
    marginRight: 6,
  },
  subjectBadge: {
    backgroundColor: '#DBEAFE',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  subjectBadgeText: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.primary,
  },
  notifMessage: {
    fontSize: 13,
    color: Colors.textSecondary,
    lineHeight: 18,
    marginBottom: 6,
  },
  notifFooter: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  notifTime: {
    fontSize: 11,
    color: Colors.textMuted,
    marginLeft: 4,
  },
  footerContainer: {
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight,
    marginTop: 4,
  },
  dismissButton: {
    paddingVertical: 11,
    alignItems: 'center',
    borderRadius: 12,
    backgroundColor: Colors.primaryLight,
  },
  dismissText: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.primary,
  },
});
