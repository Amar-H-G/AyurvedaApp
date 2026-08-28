/**
 * DoctorCard — displays a single doctor in the list.
 * Memoized to prevent re-renders during list scrolling.
 */
import React, { memo, useCallback } from 'react';
import { View, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { Doctor } from '../../../types';
import { useTheme } from '../../../hooks/useTheme';
import { Typography } from '../../../components/design-system/Typography';
import { Card } from '../../../components/design-system/Card';
import { Chip } from '../../../components/design-system/Chip';

interface DoctorCardProps {
  doctor: Doctor;
  onPress: (doctor: Doctor) => void;
}

function DoctorCardBase({ doctor, onPress }: DoctorCardProps): React.JSX.Element {
  const theme = useTheme();
  const handlePress = useCallback(() => onPress(doctor), [doctor, onPress]);

  return (
    <TouchableOpacity
      onPress={handlePress}
      activeOpacity={0.85}
      accessibilityLabel={`${doctor.name}, ${doctor.specialty}, rating ${doctor.rating} stars`}
      accessibilityRole="button"
      accessibilityHint="Tap to view doctor details and available slots"
    >
      <Card style={styles.card} variant="elevated">
        <View style={styles.row}>
          <Image
            source={{ uri: doctor.imageUrl }}
            style={[styles.avatar, { borderColor: theme.colors.primaryLight }]}
            accessibilityElementsHidden
          />
          <View style={styles.info}>
            <Typography variant="h4" color={theme.colors.textPrimary} numberOfLines={1}>
              {doctor.name}
            </Typography>
            <Typography variant="bodySmall" color={theme.colors.primary} numberOfLines={1}>
              {doctor.specialty}
            </Typography>
            <Typography variant="caption" color={theme.colors.textSecondary}>
              {doctor.qualification} · {doctor.experience}y exp
            </Typography>
            <View style={styles.metaRow}>
              <Typography variant="caption" color={theme.colors.warning}>
                ★ {doctor.rating}
              </Typography>
              <Typography variant="caption" color={theme.colors.textTertiary}>
                {' '}({doctor.reviewCount})
              </Typography>
              <Typography variant="caption" color={theme.colors.textTertiary}>
                {'  '}📍 {doctor.location}
              </Typography>
            </View>
          </View>
          <View style={styles.feeCol}>
            <Typography variant="label" color={theme.colors.primary}>
              ₹{doctor.consultationFee}
            </Typography>
            {doctor.availableToday && (
              <View style={[styles.availableBadge, { backgroundColor: theme.colors.successBackground }]}>
                <Typography variant="caption" color={theme.colors.success}>Today</Typography>
              </View>
            )}
          </View>
        </View>
        {doctor.tags.length > 0 && (
          <View style={styles.tags}>
            {doctor.tags.slice(0, 3).map(tag => (
              <Chip key={tag} label={tag} variant="tag" style={styles.tag} />
            ))}
          </View>
        )}
      </Card>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    marginHorizontal: 16,
    marginVertical: 6,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    borderWidth: 2,
    marginRight: 12,
  },
  info: {
    flex: 1,
    gap: 2,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
    flexWrap: 'wrap',
  },
  feeCol: {
    alignItems: 'flex-end',
    gap: 4,
    marginLeft: 8,
  },
  availableBadge: {
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  tags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
    marginTop: 10,
  },
  tag: {
    marginRight: 4,
  },
});

export const DoctorCard = memo(DoctorCardBase);
