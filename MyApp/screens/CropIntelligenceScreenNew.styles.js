import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1C1C1C', // Dark background for the entire screen
    paddingTop: 10, // Added top padding
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1C1C1C',
    paddingTop: 10, // Added top padding to loading container as well
  },
  loadingText: {
    marginTop: 15,
    fontSize: 18,
    color: '#E0E0E0', // Light grey text
    fontWeight: '500',
  },
  header: {
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
  },
  headerGradient: {
    paddingBottom: 25,
    borderBottomLeftRadius: 30, // Rounded bottom corners for the gradient header
    borderBottomRightRadius: 30,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 60,
  },
  backButton: {
    padding: 8,
    marginRight: 10,
  },
  headerTitleContainer: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    letterSpacing: 0.5,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 5,
  },
  headerSubtitle: {
    fontSize: 15,
    color: 'rgba(255,255,255,0.85)',
    marginLeft: 5,
    fontWeight: '500',
  },
  refreshButton: {
    padding: 8,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 20,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  currentWeatherMainCard: {
    marginTop: 20,
    marginHorizontal: 20,
    backgroundColor: 'rgba(255,255,255,0.08)', // Slightly transparent white
    borderRadius: 15,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
  },
  currentWeatherMainInfo: {
    flexDirection: 'column',
    alignItems: 'center',
  },
  currentWeatherVisual: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  currentWeatherBigIcon: {
    width: 80,
    height: 80,
    marginRight: 15,
  },
  currentWeatherTemperature: {
    fontSize: 48,
    fontWeight: '200',
    color: 'white',
    lineHeight: 50,
  },
  currentWeatherDescription: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.7)',
    textTransform: 'capitalize',
    marginTop: 5,
  },
  currentWeatherDetailsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
    width: '100%',
  },
  weatherDetailItem: {
    alignItems: 'center',
    width: '48%', // Approx half width
    marginBottom: 15,
    paddingVertical: 8,
  },
  weatherDetailValue: {
    fontSize: 18,
    fontWeight: '600',
    color: 'white',
    marginTop: 5,
  },
  weatherDetailLabel: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.6)',
    marginTop: 2,
  },
  forecastSection: {
    marginTop: 20,
    marginBottom: 10,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 15,
  },
  subSectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#E0E0E0', // Light text for dark background
    marginLeft: 10,
  },
  forecastScroll: {
    paddingLeft: 20,
  },
  forecastCard: {
    borderRadius: 15,
    padding: 15,
    marginRight: 15,
    alignItems: 'center',
    minWidth: 120,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    borderWidth: 1,
    borderColor: '#E0E0E0', // Light border
  },
  forecastDate: {
    fontSize: 13,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  forecastIcon: {
    width: 45,
    height: 45,
    marginBottom: 8,
  },
  forecastTemp: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1A237E',
    marginBottom: 4,
  },
  forecastDesc: {
    fontSize: 13,
    color: '#666',
    marginBottom: 8,
  },
  forecastDetails: {
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#EEE',
    paddingTop: 8,
    width: '100%',
  },
  forecastLabel: {
    fontSize: 11,
    color: '#999',
    marginBottom: 2,
  },
  forecastValue: {
    fontSize: 12,
    fontWeight: '600',
    color: '#333',
  },
  tabBarContainer: {
    backgroundColor: '#1C1C1C', // Match container background
    paddingBottom: 5,
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: '#2C2C2C', // Darker background for tabs
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.4,
    shadowRadius: 5,
    borderTopWidth: 1,
    borderTopColor: '#444',
    marginHorizontal: 0,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    borderBottomWidth: 3,
    borderBottomColor: 'transparent',
  },
  activeTab: {
    borderBottomColor: '#00C853', // Vibrant green accent
    backgroundColor: '#3A3A3A', // Slightly lighter dark for active tab
  },
  tabText: {
    marginLeft: 10,
    fontSize: 15,
    fontWeight: '600',
    color: '#E0E0E0', // Light text for inactive tabs
  },
  activeTabText: {
    color: '#00C853', // Vibrant green for active tab text
    fontWeight: '700',
  },
  content: {
    flex: 1,
    backgroundColor: '#1C1C1C', // Match container background
  },
  scrollView: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#E0E0E0',
    marginBottom: 20,
    paddingHorizontal: 20,
  },
  combosSection: {
    paddingVertical: 20,
  },
  comboCard: {
    marginHorizontal: 20,
    marginBottom: 18,
    borderRadius: 15,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    overflow: 'hidden', // Ensures gradient respects border radius
  },
  comboCardGradient: {
    padding: 20,
    borderRadius: 15,
  },
  comboHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  comboTitleContainer: {
    flex: 1,
    marginRight: 10,
  },
  comboTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  comboSeason: {
    fontSize: 13,
    color: '#666',
    marginTop: 3,
    fontWeight: '500',
  },
  difficultyBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 15,
    alignSelf: 'flex-start',
  },
  difficultyText: {
    fontSize: 11,
    color: 'white',
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  comboDescription: {
    fontSize: 15,
    color: '#555',
    lineHeight: 22,
    marginBottom: 18,
  },
  cropsList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 18,
  },
  cropTag: {
    backgroundColor: '#E8F5E9', // Light green
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
    marginRight: 8,
    marginBottom: 8,
  },
  cropTagText: {
    fontSize: 13,
    color: '#2E7D32', // Darker green
    fontWeight: '600',
  },
  comboStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 18,
    paddingHorizontal: 5,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 10,
  },
  statText: {
    fontSize: 13,
    color: '#555',
    marginLeft: 6,
    fontWeight: '600',
  },
  comboFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: '#ECEFF1',
  },
  successRate: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  successRateText: {
    fontSize: 13,
    color: '#4CAF50',
    marginLeft: 6,
    fontWeight: '600',
  },
  farmersUsing: {
    fontSize: 13,
    color: '#777',
    fontWeight: '500',
  },
  aiSection: {
    paddingVertical: 20,
  },
  aiButtonContainer: {
    paddingHorizontal: 20,
    marginBottom: 25,
    alignItems: 'center',
  },
  aiButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#00C853', // Vibrant green for AI button
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderRadius: 12,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    minWidth: 200,
    justifyContent: 'center',
  },
  aiButtonDisabled: {
    backgroundColor: '#666',
  },
  aiButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 10,
  },
  aiResults: {
    // maxHeight: height * 0.7, // Adjust as needed, but ScrollView handles full content
  },
  confidenceBar: {
    marginHorizontal: 20,
    marginBottom: 20,
    backgroundColor: '#2A2A2A', // Dark background for bar
    borderRadius: 8,
    padding: 15,
    borderWidth: 1,
    borderColor: '#444',
  },
  confidenceText: {
    fontSize: 15,
    color: '#E0E0E0',
    marginBottom: 10,
    fontWeight: '600',
  },
  confidenceBarTrack: {
    height: 8,
    backgroundColor: '#444',
    borderRadius: 4,
    overflow: 'hidden',
  },
  confidenceBarFill: {
    height: '100%',
    backgroundColor: '#00C853', // Vibrant green
    borderRadius: 4,
  },
  aiRecommendationCard: {
    backgroundColor: '#2A2A2A', // Dark card background
    marginHorizontal: 20,
    marginBottom: 15,
    padding: 20,
    borderRadius: 15,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    borderWidth: 1,
    borderColor: '#444',
  },
  aiRecHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  aiRecTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#E0E0E0',
    flex: 1,
    marginRight: 10,
  },
  aiConfidenceBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 15,
  },
  aiConfidenceText: {
    fontSize: 12,
    color: 'white',
    fontWeight: '700',
  },
  aiRecJustification: {
    fontSize: 15,
    color: '#B0B0B0', // Lighter grey for main text
    lineHeight: 22,
    marginBottom: 18,
  },
  keyPointsSection: {
    marginBottom: 18,
  },
  bulletPoint: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
    paddingLeft: 5,
  },
  bulletText: {
    fontSize: 14,
    color: '#B0B0B0',
    marginLeft: 10,
    flex: 1,
    lineHeight: 20,
  },
  aiRecDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 18,
    borderTopWidth: 1,
    borderTopColor: '#3A3A3A',
    paddingTop: 15,
  },
  aiRecDetail: {
    flex: 1,
    alignItems: 'center',
  },
  aiRecDetailLabel: {
    fontSize: 13,
    color: '#999',
    marginBottom: 5,
  },
  aiRecDetailValue: {
    fontSize: 15,
    color: '#E0E0E0',
    fontWeight: '600',
  },
  advantagesSection: {
    marginTop: 15,
    borderTopWidth: 1,
    borderTopColor: '#3A3A3A',
    paddingTop: 15,
  },
  advantagesTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#E0E0E0',
    marginBottom: 10,
  },
  advantageItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  advantageText: {
    fontSize: 14,
    color: '#B0B0B0',
    marginLeft: 10,
    flex: 1,
    lineHeight: 20,
  },
  analysisCard: {
    backgroundColor: '#2A2A2A',
    marginHorizontal: 20,
    marginBottom: 15,
    padding: 20,
    borderRadius: 15,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    borderWidth: 1,
    borderColor: '#444',
  },
  insightsCard: {
    backgroundColor: '#2A2A2A',
    marginHorizontal: 20,
    marginBottom: 15,
    padding: 20,
    borderRadius: 15,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    borderWidth: 1,
    borderColor: '#444',
  },
  analysisTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#E0E0E0',
    marginBottom: 10,
  },
  analysisText: {
    fontSize: 15,
    color: '#B0B0B0',
    lineHeight: 22,
  },
  actionPlanCard: {
    backgroundColor: '#2A2A2A',
    marginHorizontal: 20,
    marginBottom: 20,
    padding: 20,
    borderRadius: 15,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    borderWidth: 1,
    borderColor: '#444',
  },
  actionPlanTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#E0E0E0',
    marginBottom: 15,
  },
  actionItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 15,
  },
  actionNumber: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#00C853', // Green for numbers
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
    flexShrink: 0, // Prevent number circle from shrinking
  },
  actionNumberText: {
    fontSize: 14,
    color: 'white',
    fontWeight: 'bold',
  },
  actionText: {
    fontSize: 15,
    color: '#B0B0B0',
    flex: 1,
    lineHeight: 22,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyStateText: {
    fontSize: 16,
    color: '#999',
    marginTop: 15,
    marginBottom: 20,
    textAlign: 'center',
    paddingHorizontal: 30,
  },
  retryButton: {
    backgroundColor: '#00C853',
    paddingHorizontal: 25,
    paddingVertical: 12,
    borderRadius: 10,
  },
  retryButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#1C1C1C', // Dark background for modal
  },
  modalHeaderGradient: {
    paddingBottom: 20,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  modalHeaderContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  modalCloseButton: {
    padding: 5,
    marginRight: 15,
  },
  modalTitleContainer: {
    flex: 1,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
  },
  modalContent: {
    flex: 1,
    padding: 20,
  },
  modalDescription: {
    fontSize: 16,
    color: '#B0B0B0',
    lineHeight: 24,
    marginBottom: 25,
  },
  modalSection: {
    marginBottom: 30,
  },
  modalSectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#E0E0E0',
    marginBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#3A3A3A',
    paddingBottom: 8,
  },
  modalCropsList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  modalCropTag: {
    backgroundColor: '#E8F5E9',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 10,
    marginRight: 10,
    marginBottom: 10,
  },
  modalCropTagText: {
    fontSize: 14,
    color: '#2E7D32',
    fontWeight: '600',
  },
  modalAdvantageItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  modalAdvantageText: {
    fontSize: 15,
    color: '#B0B0B0',
    marginLeft: 10,
    flex: 1,
    lineHeight: 22,
  },
  modalChallengeItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  modalChallengeText: {
    fontSize: 15,
    color: '#B0B0B0',
    marginLeft: 10,
    flex: 1,
    lineHeight: 22,
  },
  modalStatsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginTop: 15,
  },
  modalStatCard: {
    width: '48%',
    backgroundColor: '#2A2A2A',
    padding: 18,
    borderRadius: 12,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#444',
  },
  modalStatLabel: {
    fontSize: 13,
    color: '#999',
    marginBottom: 8,
  },
  modalStatValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#E0E0E0',
  },

  // Edit Modal Styles
  modalEditButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalSaveButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  editSection: {
    marginBottom: 24,
    backgroundColor: '#2A2A2A',
    borderRadius: 12,
    padding: 16,
  },
  editSectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#00C853',
    marginBottom: 16,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#E0E0E0',
    marginBottom: 8,
  },
  textInput: {
    backgroundColor: '#1A1A1A',
    borderWidth: 1,
    borderColor: '#444',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
    color: '#FFFFFF',
    minHeight: 48,
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: 'top',
    paddingTop: 12,
  },
  pickerButton: {
    backgroundColor: '#1A1A1A',
    borderWidth: 1,
    borderColor: '#444',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    minHeight: 48,
  },
  pickerButtonText: {
    fontSize: 16,
    color: '#FFFFFF',
  },
  saveButtonContainer: {
    marginTop: 24,
    marginBottom: 16,
  },
  saveButton: {
    backgroundColor: '#00C853',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 24,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#00C853',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  saveButtonDisabled: {
    backgroundColor: '#666',
    shadowOpacity: 0,
    elevation: 0,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
    marginLeft: 8,
  },
  // Tour and Reset Button Styles
  tourButtonsContainer: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  restartTourButton: {
    backgroundColor: 'rgba(16,185,129,0.1)',
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: '#10B981',
    paddingHorizontal: 16,
    paddingVertical: 10,
    marginLeft:130,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  restartTourText: {
    color: '#10B981',
    fontSize: 14,
    fontWeight: '700',
    marginLeft: 6,
    letterSpacing: 0.5,
  },
  resetTourButton: {
    backgroundColor: 'rgba(239,68,68,0.1)',
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: '#EF4444',
    paddingHorizontal: 16,
    paddingVertical: 10,
    marginLeft:10,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#EF4444',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  onboardingOverlay: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: 'rgba(0, 0, 0, 0.7)',
      zIndex: 999,
  },
  tooltipTitle: {
      // color: theme.colors.text,
      fontSize: 16,
      fontWeight: 'bold',
      marginBottom: 8
  },
  tooltipContent: {
      // color: theme.colors.textSecondary,
      fontSize: 14,
      lineHeight: 20,
      marginBottom: 16
  },
  tooltipFooter: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center'
  },
  tooltipStep: {
      // color: theme.colors.textSecondary,
      fontSize: 12
  },
  tooltipSkip: {
      // color: theme.colors.textSecondary,
      fontSize: 14
  },
  tooltipNextButton: {
      backgroundColor: '#10B981',
      paddingHorizontal: 16,
      paddingVertical: 8,
      borderRadius: 8,
  },
  tooltipNextButtonText: {
      // color: theme.colors.onPrimary,
      fontSize: 14,
      fontWeight: '600'
  },
  resetTourText: {
    color: '#EF4444',
    fontSize: 14,
    fontWeight: '700',
    marginLeft: 6,
    letterSpacing: 0.5,
  },
  responseCardsContainer: {
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  responseCard: {
    marginBottom: 15,
    borderRadius: 10,
    overflow: 'hidden',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    borderWidth: 1,
    borderColor: '#E0E0E0', // Light border
  },
  responseCardExpanded: {
    borderWidth: 2,
    borderColor: '#00C853', // Vibrant green accent
  },
  responseCardGradient: {
    padding: 15,
  },
  responseCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  responseCardTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  responseCardTitleContainer: {
    marginLeft: 10,
  },
  responseCardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#E0E0E0',
  },
  responseCardSubtitle: {
    fontSize: 14,
    color: '#999',
    marginLeft: 5,
  },
  responseCardExpandButton: {
    padding: 5,
  },
  responseCardContent: {
    paddingBottom: 10,
  },
  responseCardDescription: {
    fontSize: 14,
    color: '#CBD5E1',
    lineHeight: 20,
  },
  responseCardExpandedContent: {
    paddingTop: 10,
  },
  responseCardSection: {
    marginBottom: 10,
  },
  responseCardSectionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#E0E0E0',
    marginBottom: 5,
  },
  responseCardBulletPoint: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 5,
  },
  responseCardBulletText: {
    fontSize: 14,
    color: '#CBD5E1',
    marginLeft: 10,
    flex: 1,
    lineHeight: 20,
  },
  responseCardActionItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 5,
  },
  responseCardActionNumber: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#757575', // Grey for numbers
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
    flexShrink: 0, // Prevent number circle from shrinking
  },
  responseCardActionNumberText: {
    fontSize: 12,
    color: 'white',
    fontWeight: 'bold',
  },
  responseCardActionText: {
    fontSize: 14,
    color: '#CBD5E1',
    flex: 1,
    lineHeight: 20,
  },
  responseCardMetrics: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 5,
  },
  responseCardMetric: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  responseCardMetricLabel: {
    fontSize: 12,
    color: '#999',
    marginBottom: 2,
  },
  responseCardMetricValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#E0E0E0',
  },
  responseCardConfidence: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
  },
  responseCardConfidenceBar: {
    height: 8,
    backgroundColor: '#444',
    borderRadius: 4,
    overflow: 'hidden',
    marginRight: 5,
  },
  responseCardConfidenceFill: {
    height: '100%',
    backgroundColor: '#00C853', // Vibrant green
    borderRadius: 4,
  },
  responseCardConfidenceText: {
    fontSize: 12,
    color: '#E0E0E0',
    fontWeight: '600',
  },
  responseCardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
  },
  responseCardTimestamp: {
    fontSize: 12,
    color: '#999',
  },
  responseCardActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  responseCardActionButton: {
    padding: 5,
    marginLeft: 10,
  },
  // Additional response card styles
  responseCardMetrics: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  responseCardMetric: {
    width: '48%',
    backgroundColor: '#1A1A1A',
    padding: 8,
    borderRadius: 6,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#333',
  },
  responseCardMetricLabel: {
    fontSize: 11,
    color: '#999',
    marginBottom: 2,
  },
  responseCardMetricValue: {
    fontSize: 13,
    fontWeight: '600',
    color: '#E0E0E0',
  },
  responseCardConfidence: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  responseCardConfidenceBar: {
    flex: 1,
    height: 6,
    backgroundColor: '#444',
    borderRadius: 3,
    overflow: 'hidden',
    marginRight: 10,
  },
  responseCardConfidenceFill: {
    height: '100%',
    backgroundColor: '#00C853',
    borderRadius: 3,
  },
  responseCardConfidenceText: {
    fontSize: 12,
    color: '#E0E0E0',
    fontWeight: '600',
    minWidth: 35,
  },
  // Response Cards Summary Styles
  responseCardsSummary: {
    backgroundColor: '#2A2A2A',
    borderRadius: 12,
    padding: 15,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#444',
  },
  responseCardsSummaryText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#E0E0E0',
    marginBottom: 10,
    textAlign: 'center',
  },
  responseCardsStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  responseCardStat: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1A1A1A',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#333',
  },
  responseCardStatText: {
    fontSize: 13,
    color: '#E0E0E0',
    marginLeft: 6,
    fontWeight: '600',
  },
});

export default styles;