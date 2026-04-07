import React from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, typography, borderRadius, shadows } from '@/constants/design';
import { Container, Card, Button } from '@/components/ui';
import { blink } from '@/lib/blink';

export default function Dashboard() {
  const { data: tasks, isLoading: tasksLoading, refetch: refetchTasks } = useQuery({
    queryKey: ['tasks'],
    queryFn: () => blink.db.tasks.list({ limit: 5 }),
  });

  const { data: motivation, isLoading: motivationLoading, refetch: refetchMotivation } = useQuery({
    queryKey: ['motivation'],
    queryFn: async () => {
      const { text } = await blink.ai.generateText({
        prompt: "Give me a short, powerful motivational message for a Grade 11 student who has study goals.",
        maxTokens: 50
      });
      return text;
    },
    staleTime: 1000 * 60 * 60, // 1 hour
  });

  const onRefresh = React.useCallback(() => {
    refetchTasks();
    refetchMotivation();
  }, [refetchTasks, refetchMotivation]);

  const pendingTasks = tasks?.filter(t => t.status === 'pending') || [];

  return (
    <Container safeArea edges={['bottom']}>
      <ScrollView 
        style={styles.container}
        refreshControl={
          <RefreshControl refreshing={tasksLoading} onRefresh={onRefresh} tintColor={colors.primary} />
        }
      >
        <View style={styles.header}>
          <Text style={styles.greeting}>Hey Student!</Text>
          <Text style={styles.subGreeting}>Let's make today productive.</Text>
        </View>

        <Card variant="elevated" style={styles.motivationCard}>
          <Card.Content>
            <Ionicons name="sparkles" size={24} color={colors.accent} style={styles.sparkleIcon} />
            <Text style={styles.motivationText}>
              {motivationLoading ? 'Getting your daily boost...' : motivation}
            </Text>
          </Card.Content>
        </Card>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Upcoming Tasks</Text>
            <Text style={styles.taskCount}>{pendingTasks.length} pending</Text>
          </View>

          {pendingTasks.length === 0 && !tasksLoading ? (
            <Card style={styles.emptyCard}>
              <Card.Content>
                <Text style={styles.emptyText}>All caught up! Great job.</Text>
              </Card.Content>
            </Card>
          ) : (
            pendingTasks.map((task: any) => (
              <Card key={task.id} style={styles.taskCard} variant="flat">
                <Card.Content style={styles.taskCardContent}>
                  <View style={styles.taskInfo}>
                    <Text style={styles.taskTitle}>{task.title}</Text>
                    <View style={styles.taskMeta}>
                      <Ionicons name="calendar-outline" size={14} color={colors.textSecondary} />
                      <Text style={styles.taskDeadline}>{task.deadline}</Text>
                      <View style={[styles.badge, { backgroundColor: getDifficultyColor(task.difficulty) }]}>
                        <Text style={styles.badgeText}>Level {task.difficulty}</Text>
                      </View>
                    </View>
                  </View>
                  <Ionicons name="chevron-forward" size={20} color={colors.textTertiary} />
                </Card.Content>
              </Card>
            ))
          )}
        </View>

        <View style={styles.quickActions}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.actionGrid}>
            <Button 
              variant="outline" 
              style={styles.actionButton}
              onPress={() => {}}
            >
              <Ionicons name="add-circle-outline" size={20} color={colors.primary} />
              <Text style={styles.actionButtonText}> New Task</Text>
            </Button>
            <Button 
              variant="outline" 
              style={styles.actionButton}
              onPress={() => {}}
            >
              <Ionicons name="book-outline" size={20} color={colors.primary} />
              <Text style={styles.actionButtonText}> Learn</Text>
            </Button>
          </View>
        </View>
      </ScrollView>
    </Container>
  );
}

const getDifficultyColor = (diff: number) => {
  if (diff >= 4) return colors.error;
  if (diff >= 3) return colors.warning;
  return colors.success;
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: spacing.lg,
  },
  header: {
    marginBottom: spacing.xl,
  },
  greeting: {
    ...typography.display,
    color: colors.text,
  },
  subGreeting: {
    ...typography.body,
    color: colors.textSecondary,
  },
  motivationCard: {
    backgroundColor: colors.backgroundSecondary,
    borderLeftWidth: 4,
    borderLeftColor: colors.accent,
    marginBottom: spacing.xl,
  },
  sparkleIcon: {
    marginBottom: spacing.sm,
  },
  motivationText: {
    ...typography.bodyBold,
    color: colors.text,
    fontStyle: 'italic',
  },
  section: {
    marginBottom: spacing.xl,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  sectionTitle: {
    ...typography.h3,
    color: colors.text,
  },
  taskCount: {
    ...typography.small,
    color: colors.textSecondary,
  },
  taskCard: {
    marginBottom: spacing.sm,
    backgroundColor: colors.backgroundSecondary,
    borderWidth: 1,
    borderColor: colors.borderDarkMode,
  },
  taskCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  taskInfo: {
    flex: 1,
  },
  taskTitle: {
    ...typography.bodyBold,
    color: colors.text,
    marginBottom: 4,
  },
  taskMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  taskDeadline: {
    ...typography.small,
    color: colors.textSecondary,
    marginLeft: 4,
    marginRight: spacing.md,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: borderRadius.full,
  },
  badgeText: {
    ...typography.tiny,
    color: colors.white,
    fontWeight: '700',
  },
  emptyCard: {
    backgroundColor: colors.backgroundTertiary,
    opacity: 0.6,
  },
  emptyText: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  quickActions: {
    marginBottom: spacing.xxl,
  },
  actionGrid: {
    flexDirection: 'row',
    marginTop: spacing.md,
    gap: spacing.md,
  },
  actionButton: {
    flex: 1,
    height: 60,
    backgroundColor: colors.backgroundSecondary,
    borderColor: colors.borderDarkMode,
  },
  actionButtonText: {
    ...typography.bodyBold,
    color: colors.text,
  },
});
