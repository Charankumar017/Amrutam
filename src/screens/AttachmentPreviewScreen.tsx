import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { EmptyState } from '@/components/EmptyState';
import { ErrorState } from '@/components/ErrorState';
import { ScreenContainer } from '@/components/ScreenContainer';
import { useHealthRecord } from '@/hooks/useHealthRecords';
import type { RootScreenProps } from '@/navigation/types';
import { useTranslation } from '@/hooks/useTranslation';

const THUMB_HUES = [86, 140, 168, 42, 12, 200, 265, 320];

export function AttachmentPreviewScreen({ route }: RootScreenProps<'AttachmentPreview'>) {
  const { t } = useTranslation();
  const { recordId, attachmentId } = route.params;
  const record = useHealthRecord(recordId);
  if (record.isError) {
    return (
      <ScreenContainer testID="attachment-preview-error">
        <ErrorState error={record.error} onRetry={() => void record.refetch()} />
      </ScreenContainer>
    );
  }
  const attachment = record.data?.attachments.find(item => item.id === attachmentId);
  if (record.isSuccess && !attachment) {
    return (
      <ScreenContainer testID="attachment-missing">
        <EmptyState
          glyph="📄"
          title={t('records.attachmentUnavailable')}
          description={t('records.attachmentRemoved')}
        />
      </ScreenContainer>
    );
  }
  const hue = THUMB_HUES[(attachment?.thumbSeed ?? 0) % THUMB_HUES.length]!;
  return (
    <ScreenContainer testID="attachment-preview-screen" padded>
      <View style={styles.stack}>
        <View
          style={[
            styles.preview,
            {
              backgroundColor: `hsl(${hue}, 45%, 90%)`,
            },
          ]}
        />
        <View style={styles.caption}>
          <Text style={styles.name}>{attachment?.name ?? 'Loading…'}</Text>
          {attachment ? (
            <Text style={styles.meta}>
              {`${attachment.kind.toUpperCase()} · ${Math.round(attachment.sizeKb)} KB${
                attachment.pageCount ? ` · ${attachment.pageCount} pages` : ''
              }`}
            </Text>
          ) : null}
        </View>
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  stack: {
    paddingTop: 16,
    gap: 16,
    alignItems: 'center',
  },
  preview: {
    width: '100%',
    height: 280,
    borderRadius: 10,
  },
  caption: {
    alignItems: 'center',
    gap: 4,
  },
  name: {
    fontSize: 17,
    lineHeight: 23,
    fontWeight: '600',
    color: '#14170F',
  },
  meta: {
    fontSize: 13,
    lineHeight: 18,
    color: '#5D665A',
  },
});
