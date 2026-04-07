import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, typography, borderRadius } from '@/constants/design';
import { Container, Card, Button, Input, Avatar } from '@/components/ui';
import { blink } from '@/lib/blink';

export default function ProfileScreen() {
  const queryClient = useQueryClient();
  const [availableTime, setAvailableTime] = useState('');
  const [suggestion, setSuggestion] = useState('');
  const [isSuggesting, setIsSuggesting] = useState(false);

  const { data: profile, isLoading: profileLoading } = useQuery({
    queryKey: ['profile'],
    queryFn: async () => {
      const list = await blink.db.user_profiles.list({ where: { user_id: 'demo-user' } });
      return list[0] || null;
    },
  });

  const { data: tasks } = useQuery({
    queryKey: ['tasks'],
    queryFn: () => blink.db.tasks.list({ where: { status: 'pending' } }),
  });

  const updateProfileMutation = useMutation({
    mutationFn: async (data: { grade?: string; study_goals?: string }) => {
      if (profile) {
        await blink.db.user_profiles.update({ id: profile.id, ...data });
      } else {
        await blink.db.user_profiles.create({
          id: Math.random().toString(36).substr(2, 9),
          user_id: 'demo-user',
          ...data
        });
      }
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['profile'] }),
  });

  const suggestStudyPlanMutation = useMutation({
    mutationFn: async () => {
      setIsSuggesting(true);
      const pendingTasks = tasks || [];
      const prompt = `I am a ${profile?.grade || 'high school'} student with ${availableTime} minutes available to study. 
      My pending tasks are: ${JSON.stringify(pendingTasks.map(t => t.title))}. 
      Give me a specific study plan for these ${availableTime} minutes. 
      Format with bullet points and be encouraging.`;

      const { text } = await blink.ai.generateText({ prompt, maxTokens: 300 });
      setSuggestion(text);
      setIsSuggesting(false);
    },
    onError: () => setIsSuggesting(false),
  });

  return (
    <Container safeArea edges={['bottom']}>
      <ScrollView style={styles.container}>
        <View style={styles.profileHeader}>
          <Avatar 
            name="Demo Student" 
            size="xl" 
            containerStyle={styles.avatar}
          />
          <Text style={styles.profileName}>Demo Student</Text>
          <Text style={styles.profileRole}>{profile?.grade || 'Grade Not Set'}</Text>
        </View>

        <Card style={styles.sectionCard}>
          <Card.Header>
            <Text style={styles.sectionTitle}>Preferences</Text>
          </Card.Header>
          <Card.Content>
            <Input
              label="Grade / Year"
              placeholder="e.g., Grade 11"
              value={profile?.grade || ''}
              onChangeText={(text) => updateProfileMutation.mutate({ grade: text })}
              containerStyle={styles.input}
            />
            <Input
              label="Study Goals"
              placeholder="e.g., Improve Math, Stay organized"
              value={profile?.study_goals || ''}
              onChangeText={(text) => updateProfileMutation.mutate({ study_goals: text })}
              multiline
              containerStyle={styles.input}
            />
          </Card.Content>
        </Card>

        <Card style={styles.suggestionCard} variant="elevated">
          <Card.Header>
            <View style={styles.cardHeaderRow}>
              <Ionicons name="timer-outline" size={24} color={colors.primary} />
              <Text style={styles.sectionTitle}>Smart Study Plan</Text>
            </View>
          </Card.Header>
          <Card.Content>
            <Text style={styles.label}>How many minutes do you have right now?</Text>
            <Input
              placeholder="e.g., 45, 90"
              keyboardType="numeric"
              value={availableTime}
              onChangeText={setAvailableTime}
              containerStyle={styles.input}
            />
            <Button 
              variant="primary" 
              onPress={() => suggestStudyPlanMutation.mutate()}
              loading={isSuggesting}
              disabled={!availableTime}
            >
              Generate Plan
            </Button>

            {suggestion ? (
              <View style={styles.suggestionContainer}>
                <Text style={styles.suggestionTitle}>Your AI Study Plan:</Text>
                <Text style={styles.suggestionText}>{suggestion}</Text>
              </View>
            ) : null}
          </Card.Content>
        </Card>

        <View style={styles.footer}>
          <Button variant="ghost" onPress={() => {}}>Sign Out</Button>
          <Text style={styles.versionText}>AI Study Coach v1.0.0</Text>
        </View>
      </ScrollView>
    </Container>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: spacing.lg,
  },
  profileHeader: {
    alignItems: 'center',
    marginBottom: spacing.xl,
    paddingTop: spacing.md,
  },
  avatar: {
    marginBottom: spacing.md,
    backgroundColor: colors.primary,
  },
  profileName: {
    ...typography.h2,
    color: colors.text,
  },
  profileRole: {
    ...typography.body,
    color: colors.textSecondary,
  },
  sectionCard: {
    backgroundColor: colors.backgroundSecondary,
    marginBottom: spacing.xl,
    borderWidth: 1,
    borderColor: colors.borderDarkMode,
  },
  sectionTitle: {
    ...typography.h3,
    color: colors.text,
  },
  input: {
    marginBottom: spacing.md,
  },
  suggestionCard: {
    backgroundColor: colors.backgroundSecondary,
    marginBottom: spacing.xxl,
    borderLeftWidth: 4,
    borderLeftColor: colors.primary,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  label: {
    ...typography.body,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
  },
  suggestionContainer: {
    marginTop: spacing.xl,
    padding: spacing.md,
    backgroundColor: colors.background,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.borderDarkMode,
  },
  suggestionTitle: {
    ...typography.bodyBold,
    color: colors.accent,
    marginBottom: spacing.sm,
  },
  suggestionText: {
    ...typography.body,
    color: colors.text,
    lineHeight: 22,
  },
  footer: {
    alignItems: 'center',
    marginBottom: 60,
  },
  versionText: {
    ...typography.tiny,
    color: colors.textTertiary,
    marginTop: spacing.sm,
  },
});
