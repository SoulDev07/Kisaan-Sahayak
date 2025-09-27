import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Icon from './Icon';
import AnimatedCard from './AnimatedCard';
import { useTheme } from '../context/ThemeContext';

const TimelineNode = ({ isFirst, isLast, title, date, details, priority = 'normal', completed = false }) => {
  const { theme } = useTheme();
  const circleColor = completed ? theme.colors.success : priority === 'high' ? theme.colors.danger : theme.colors.surface;
  return (
    <AnimatedCard>
      <View style={[styles.timelineNode, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}> 
        <View style={styles.timelineIconContainer}>
          <View style={[styles.timelineLine, isFirst && {backgroundColor: 'transparent'}, { backgroundColor: theme.colors.border }]} />
          <View style={[
            styles.timelineCircle,
            { backgroundColor: circleColor }
          ]}>
            <Icon name={completed ? '✓' : priority === 'high' ? '!' : '🗓️'} style={{fontSize: 14}} color={theme.colors.card} />
          </View>
          <View style={[styles.timelineLine, isLast && {backgroundColor: 'transparent'}, { backgroundColor: theme.colors.border }]} />
        </View>
        <View style={styles.timelineTextContainer}>
          <View style={styles.timelineHeader}>
            <Text style={[styles.timelineTitle, completed && { color: theme.colors.success }, { color: theme.colors.text }]}>{title}</Text>
            {priority === 'high' && (
              <View style={[styles.priorityBadge, { backgroundColor: theme.colors.danger }]}>
                <Text style={[styles.priorityText, { color: theme.colors.card }]}>URGENT</Text>
              </View>
            )}
          </View>
          <Text style={[styles.timelineDate, { color: theme.colors.primary }]}>{date}</Text>
          <Text style={[styles.timelineDetails, { color: theme.colors.textSecondary }]}>{details}</Text>
        </View>
      </View>
    </AnimatedCard>
  );
};

const styles = StyleSheet.create({
  timelineNode: {
    flexDirection: 'row',
    marginBottom: 15,
    backgroundColor: '#1A1A1A',
    borderRadius: 12,
    padding: 15,
  },
  timelineIconContainer: {
    alignItems: 'center',
    marginRight: 15,
    width: 30,
  },
  timelineLine: {
    width: 2,
    height: 20,
    backgroundColor: '#4A4A4A',
  },
  timelineCircle: {
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 5,
  },
  timelineTextContainer: {
    flex: 1,
  },
  timelineHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 5,
  },
  timelineTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
    flex: 1,
  },
  priorityBadge: {
    backgroundColor: '#E74C3C',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  priorityText: {
    fontSize: 10,
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  timelineDate: {
    fontSize: 12,
    color: '#58D68D',
    marginBottom: 5,
  },
  timelineDetails: {
    fontSize: 14,
    color: '#A9A9A9',
    lineHeight: 20,
  },
});

export default TimelineNode; 