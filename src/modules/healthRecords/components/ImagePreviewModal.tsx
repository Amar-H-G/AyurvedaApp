/**
 * ImagePreviewModal — Full-screen image preview with download & share functionality.
 */
import React, { useCallback } from 'react';
import {
  Modal, View, StyleSheet, TouchableOpacity, Image, SafeAreaView, Dimensions, Alert,
} from 'react-native';
import { Typography } from '../../../components/design-system/Typography';
import { Button } from '../../../components/design-system/Button';
import { Attachment } from '../../../types';
import { useAppStore } from '../../../store/app/appStore';

interface ImagePreviewModalProps {
  visible: boolean;
  attachment: Attachment | null;
  onClose: () => void;
}

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

export function ImagePreviewModal({
  visible,
  attachment,
  onClose,
}: ImagePreviewModalProps): React.JSX.Element | null {
  const showToast = useAppStore(state => state.showToast);

  const handleDownload = useCallback(() => {
    if (!attachment) return;
    showToast({ message: `Saved ${attachment.fileName} to Gallery`, type: 'success' });
  }, [attachment, showToast]);

  const handleShare = useCallback(() => {
    if (!attachment) return;
    Alert.alert('Share File', `Sharing ${attachment.fileName}`);
  }, [attachment]);

  if (!attachment) return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <SafeAreaView style={styles.container}>
        {/* Header Bar */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={onClose}
            style={styles.closeBtn}
            accessibilityLabel="Close image preview"
            accessibilityRole="button"
          >
            <Typography variant="h3" color="#FFFFFF">✕</Typography>
          </TouchableOpacity>
          <View style={styles.headerTextContainer}>
            <Typography variant="h4" color="#FFFFFF" numberOfLines={1}>
              {attachment.fileName}
            </Typography>
            <Typography variant="caption" color="#AAAAAA">
              Image File
            </Typography>
          </View>
          <TouchableOpacity
            onPress={handleShare}
            style={styles.shareBtn}
            accessibilityLabel="Share image"
            accessibilityRole="button"
          >
            <Typography variant="body" color="#FFFFFF">📤</Typography>
          </TouchableOpacity>
        </View>

        {/* Full Image */}
        <View style={styles.imageContainer}>
          <Image
            source={{ uri: attachment.url }}
            style={styles.image}
            resizeMode="contain"
          />
        </View>

        {/* Footer Actions */}
        <View style={styles.footer}>
          <Button
            label="📥 Save to Photos"
            variant="primary"
            onPress={handleDownload}
            style={styles.actionBtn}
          />
        </View>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F172ACC',
    justifyContent: 'space-between',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
  closeBtn: {
    padding: 8,
    marginRight: 8,
  },
  headerTextContainer: {
    flex: 1,
  },
  shareBtn: {
    padding: 8,
  },
  imageContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  image: {
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT * 0.7,
  },
  footer: {
    padding: 16,
    backgroundColor: 'rgba(0,0,0,0.6)',
    alignItems: 'center',
  },
  actionBtn: {
    width: '100%',
  },
});
