import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, SafeAreaView, Dimensions, Modal } from "react-native";
import { useGetTreatments, useGetTreatmentPhases, useMedicationByPhaseIdData } from "../hook/useTreatment";
import Ionicons from "react-native-vector-icons/Ionicons";
import { COLORS } from "../theme/color";
import Toast from "react-native-toast-message";

// Define interfaces for our data structures
interface Treatment {
  id: string;
  name: string;
  start_date: string;
  status: string;
  description?: string;
}

interface Phase {
  id: string;
  phase_name: string;
  description: string;
  start_date: string;
  end_date?: string;
  status: string;
}

interface Medication {
  id: string;
  medicine_name: string;
  dosage: string;
  frequency: string;
  notes?: string;
}

interface TreatmentPageProps {
  petId: string;
}

const TreatmentPage = ({ petId }: TreatmentPageProps) => {
  const [selectedTreatment, setSelectedTreatment] = useState<Treatment | null>(null);
  const [selectedPhase, setSelectedPhase] = useState<string | null>(null);
  const [detailModalVisible, setDetailModalVisible] = useState<boolean>(false);
  
  // Fetch treatments for pet
  const { 
    data: treatments, 
    isLoading: treatmentsLoading, 
    error: treatmentsError 
  } = useGetTreatments(petId);
  
  // Fetch phases for selected treatment
  const { 
    data: phases, 
    isLoading: phasesLoading 
  } = useGetTreatmentPhases(
    selectedTreatment?.id || "", 
    !!selectedTreatment
  );
  
  // Fetch medications for selected phase
  const { 
    data: medications, 
    isLoading: medicationsLoading 
  } = useMedicationByPhaseIdData(
    selectedTreatment?.id || "", 
    selectedPhase || "", 
    !!selectedTreatment && !!selectedPhase
  );
  
  // Reset selected phase when treatment changes
  useEffect(() => {
    if (phases && phases.length > 0) {
      setSelectedPhase(phases[0].id);
    } else {
      setSelectedPhase(null);
    }
  }, [phases]);

  if (treatmentsLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.button.choose} />
        <Text style={styles.loadingText}>Đang tải dữ liệu điều trị...</Text>
      </View>
    );
  }

  if (treatmentsError) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Có lỗi xảy ra khi tải dữ liệu</Text>
      </View>
    );
  }

  if (!treatments || treatments.length === 0) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.noDataText}>Không có dữ liệu điều trị nào cho thú cưng này</Text>
      </View>
    );
  }

  // Format date function
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`;
  };

  const handleTreatmentPress = (treatment: Treatment) => {
    setSelectedTreatment(treatment);
    setDetailModalVisible(true);
    
    Toast.show({
      type: 'info',
      text1: 'Xem chi tiết điều trị',
      text2: `${treatment.name}`,
      position: 'bottom',
      visibilityTime: 3000,
      bottomOffset: 40,
      autoHide: true,
    });
  };

  const renderTreatmentsList = () => (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Phác đồ điều trị</Text>
      
      <View style={styles.treatmentsContainer}>
        {treatments.map((treatment: Treatment) => (
          <TouchableOpacity
            key={treatment.id}
            style={styles.treatmentCardLarge}
            onPress={() => handleTreatmentPress(treatment)}
          >
            <View style={styles.treatmentCardHeader}>
              <Text style={styles.treatmentName} numberOfLines={2}>{treatment.name}</Text>
              <View 
                style={[
                  styles.statusIndicator, 
                  { backgroundColor: getStatusColor(treatment.status) }
                ]}
              />
            </View>
            <Text style={styles.treatmentDate}>
              Bắt đầu: {formatDate(treatment.start_date)}
            </Text>
            <View style={styles.treatmentFooter}>
              <Text 
                style={[
                  styles.statusBadge, 
                  { backgroundColor: getStatusColor(treatment.status) }
                ]}
              >
                {treatment.status}
              </Text>
              <View style={styles.viewDetailButton}>
                <Text style={styles.viewDetailText}>Xem chi tiết</Text>
                <Ionicons name="chevron-forward" size={16} color={COLORS.button.choose} />
              </View>
            </View>
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  );

  const renderTreatmentDetail = () => (
    <Modal
      animationType="slide"
      transparent={false}
      visible={detailModalVisible}
      onRequestClose={() => setDetailModalVisible(false)}
    >
      <SafeAreaView style={styles.detailContainer}>
        <View style={styles.detailHeader}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => setDetailModalVisible(false)}
          >
            <Ionicons name="chevron-back" size={24} color={COLORS.button.choose} />
            <Text style={styles.backButtonText}>Quay lại</Text>
          </TouchableOpacity>
          <Text style={styles.detailTitle} numberOfLines={1}>Chi tiết điều trị</Text>
          <View style={{ width: 40 }} />
        </View>
        
        <ScrollView style={styles.detailScrollView}>
          {/* Treatment Info */}
          <View style={styles.treatmentDetailCard}>
            <Text style={styles.detailTreatmentName}>{selectedTreatment?.name}</Text>
            <View style={styles.detailTreatmentInfo}>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Trạng thái:</Text>
                <Text 
                  style={[
                    styles.statusBadge, 
                    { backgroundColor: getStatusColor(selectedTreatment?.status || '') }
                  ]}
                >
                  {selectedTreatment?.status}
                </Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Ngày bắt đầu:</Text>
                <Text style={styles.infoValue}>{selectedTreatment ? formatDate(selectedTreatment.start_date) : ''}</Text>
              </View>
              {selectedTreatment?.description && (
                <View style={styles.descriptionContainer}>
                  <Text style={styles.descriptionTitle}>Mô tả:</Text>
                  <Text style={styles.descriptionText}>{selectedTreatment.description}</Text>
                </View>
              )}
            </View>
          </View>
          
          {/* Phases Section */}
          <View style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>Các giai đoạn</Text>
            
            {phasesLoading ? (
              <View style={styles.loadingSectionContainer}>
                <ActivityIndicator size="small" color={COLORS.button.choose} />
                <Text style={styles.loadingSectionText}>Đang tải dữ liệu giai đoạn...</Text>
              </View>
            ) : phases && phases.length > 0 ? (
              <>
                <ScrollView 
                  horizontal 
                  showsHorizontalScrollIndicator={false} 
                  style={styles.phasesScrollView}
                  contentContainerStyle={styles.phasesScrollContent}
                >
                  {phases.map((phase: Phase) => (
                    <TouchableOpacity
                      key={phase.id}
                      style={[
                        styles.phaseTab,
                        selectedPhase === phase.id && styles.selectedPhaseTab,
                      ]}
                      onPress={() => setSelectedPhase(phase.id)}
                    >
                      <Text 
                        style={[
                          styles.phaseTabText,
                          selectedPhase === phase.id && styles.selectedPhaseTabText
                        ]}
                      >
                        {phase.phase_name}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
                
                {/* Selected Phase Details */}
                {selectedPhase && phases.map((phase: Phase) => (
                  phase.id === selectedPhase && (
                    <View key={`details-${phase.id}`} style={styles.phaseDetailCard}>
                      <View style={styles.phaseHeader}>
                        <View style={styles.phaseHeaderLeft}>
                          <Text style={styles.phaseName}>{phase.phase_name}</Text>
                          <View 
                            style={[
                              styles.phaseStatusIndicator, 
                              { backgroundColor: getStatusColor(phase.status) }
                            ]}
                          />
                        </View>
                        <Text 
                          style={[
                            styles.phaseStatusBadge, 
                            { backgroundColor: getStatusColor(phase.status) }
                          ]}
                        >
                          {phase.status}
                        </Text>
                      </View>
                      
                      <View style={styles.phaseDates}>
                        <Text style={styles.phaseDateLabel}>Bắt đầu:</Text>
                        <Text style={styles.phaseDate}>{formatDate(phase.start_date)}</Text>
                        
                        <Text style={[styles.phaseDateLabel, { marginLeft: 20 }]}>Kết thúc:</Text>
                        <Text style={styles.phaseDate}>
                          {phase.end_date ? formatDate(phase.end_date) : "Hiện tại"}
                        </Text>
                      </View>
                      
                      {phase.description && (
                        <View style={styles.phaseDescriptionContainer}>
                          <Text style={styles.phaseDescriptionTitle}>Mô tả giai đoạn:</Text>
                          <Text style={styles.phaseDescription}>{phase.description}</Text>
                        </View>
                      )}
                      
                      {/* Medications in this phase */}
                      <View style={styles.medicationsContainer}>
                        <Text style={styles.medicationsTitle}>Thuốc điều trị</Text>
                        
                        {medicationsLoading ? (
                          <View style={styles.loadingSectionContainer}>
                            <ActivityIndicator size="small" color={COLORS.button.choose} />
                            <Text style={styles.loadingSectionText}>Đang tải dữ liệu thuốc...</Text>
                          </View>
                        ) : medications && medications.length > 0 ? (
                          <View style={styles.medicationsList}>
                            {medications.map((medication: Medication) => (
                              <View key={medication.id} style={styles.medicationCard}>
                                <Text style={styles.medicationName}>{medication.medicine_name}</Text>
                                <View style={styles.medicationDivider} />
                                <View style={styles.medicationDetail}>
                                  <Text style={styles.medicationLabel}>Liều lượng:</Text>
                                  <Text style={styles.medicationValue}>{medication.dosage}</Text>
                                </View>
                                <View style={styles.medicationDetail}>
                                  <Text style={styles.medicationLabel}>Tần suất:</Text>
                                  <Text style={styles.medicationValue}>{medication.frequency}</Text>
                                </View>
                                {medication.notes && (
                                  <View style={styles.medicationNoteContainer}>
                                    <Text style={styles.medicationNoteLabel}>Ghi chú:</Text>
                                    <Text style={styles.medicationNotes}>{medication.notes}</Text>
                                  </View>
                                )}
                              </View>
                            ))}
                          </View>
                        ) : (
                          <View style={styles.noDataContainer}>
                            <Text style={styles.noDataText}>
                              Không có thuốc nào được chỉ định trong giai đoạn này
                            </Text>
                          </View>
                        )}
                      </View>
                    </View>
                  )
                ))}
              </>
            ) : (
              <View style={styles.noDataContainer}>
                <Text style={styles.noDataText}>
                  Không có giai đoạn nào được tìm thấy cho đợt điều trị này
                </Text>
              </View>
            )}
          </View>
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );

  return (
    <>
      {renderTreatmentsList()}
      {renderTreatmentDetail()}
    </>
  );
};

// Helper function to get color based on status
const getStatusColor = (status: string) => {
  switch (status.toLowerCase()) {
    case "completed":
    case "hoàn thành":
      return COLORS.status.success;
    case "in progress":
    case "đang tiến hành":
    case "active":
      return COLORS.button.choose;
    case "scheduled":
    case "lên lịch":
    case "not started":
      return COLORS.status.pending;
    case "cancelled":
    case "hủy":
      return COLORS.status.cancel;
    default:
      return COLORS.text.default;
  }
};

const windowWidth = Dimensions.get('window').width;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background.gray,
    padding: 16,
  },
  detailContainer: {
    flex: 1,
    backgroundColor: COLORS.background.gray,
  },
  detailHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: COLORS.background.white,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButtonText: {
    fontSize: 16,
    color: COLORS.button.choose,
    marginLeft: 4,
    fontWeight: '500',
  },
  detailTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text.text,
    flex: 1,
    textAlign: 'center',
  },
  detailScrollView: {
    flex: 1,
    padding: 16,
  },
  treatmentDetailCard: {
    backgroundColor: COLORS.background.white,
    padding: 16,
    borderRadius: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
    marginBottom: 16,
  },
  detailTreatmentName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.text.text,
    marginBottom: 12,
  },
  detailTreatmentInfo: {
    marginTop: 8,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  infoLabel: {
    fontSize: 15,
    fontWeight: '500',
    color: COLORS.text.default,
    marginRight: 8,
    width: 100,
  },
  infoValue: {
    fontSize: 15,
    color: COLORS.text.text,
    flex: 1,
  },
  descriptionContainer: {
    marginTop: 12,
    padding: 12,
    backgroundColor: COLORS.background.lightBlue,
    borderRadius: 12,
  },
  descriptionTitle: {
    fontSize: 15,
    fontWeight: '500',
    color: COLORS.text.default,
    marginBottom: 6,
  },
  descriptionText: {
    fontSize: 15,
    color: COLORS.text.text,
    lineHeight: 22,
  },
  sectionContainer: {
    backgroundColor: COLORS.background.white,
    padding: 16,
    borderRadius: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text.text,
    marginBottom: 16,
  },
  phasesScrollView: {
    marginBottom: 16,
    flexGrow: 0,
  },
  phasesScrollContent: {
    paddingRight: 20,
  },
  phaseTab: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    marginRight: 10,
    borderRadius: 20,
    backgroundColor: '#F0F0F0',
    borderWidth: 1,
    borderColor: 'transparent',
  },
  selectedPhaseTab: {
    backgroundColor: COLORS.background.lightBlue,
    borderColor: COLORS.button.choose,
  },
  phaseTabText: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.text.default,
  },
  selectedPhaseTabText: {
    color: COLORS.button.choose,
  },
  phaseDetailCard: {
    backgroundColor: COLORS.background.lightBlue,
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.button.choose,
  },
  phaseHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  phaseHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  phaseName: {
    fontSize: 17,
    fontWeight: 'bold',
    color: COLORS.text.text,
    marginRight: 10,
  },
  phaseStatusIndicator: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  phaseStatusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    fontSize: 12,
    fontWeight: '500',
    color: COLORS.text.status,
  },
  phaseDates: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    marginBottom: 12,
  },
  phaseDateLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.text.default,
  },
  phaseDate: {
    fontSize: 14,
    color: COLORS.text.text,
    marginLeft: 4,
  },
  phaseDescriptionContainer: {
    marginBottom: 16,
    paddingVertical: 10,
    paddingHorizontal: 12,
    backgroundColor: COLORS.background.white,
    borderRadius: 10,
  },
  phaseDescriptionTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.text.default,
    marginBottom: 6,
  },
  phaseDescription: {
    fontSize: 14,
    color: COLORS.text.text,
    lineHeight: 22,
  },
  medicationsContainer: {
    marginTop: 16,
  },
  medicationsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.text.text,
    marginBottom: 12,
  },
  medicationsList: {
    gap: 12,
  },
  medicationCard: {
    backgroundColor: COLORS.background.white,
    padding: 14,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  medicationName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.text.text,
    marginBottom: 10,
  },
  medicationDivider: {
    height: 1,
    backgroundColor: COLORS.border.input,
    marginBottom: 10,
  },
  medicationDetail: {
    flexDirection: 'row',
    marginBottom: 6,
  },
  medicationLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.text.default,
    width: 80,
  },
  medicationValue: {
    fontSize: 14,
    color: COLORS.text.text,
    flex: 1,
  },
  medicationNoteContainer: {
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: COLORS.border.input,
  },
  medicationNoteLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.text.default,
    marginBottom: 4,
  },
  medicationNotes: {
    fontSize: 14,
    color: COLORS.text.default,
    fontStyle: 'italic',
    lineHeight: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: COLORS.background.gray,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: COLORS.text.default,
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: COLORS.background.gray,
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: COLORS.status.cancel,
    textAlign: "center",
  },
  title: {
    fontSize: 26,
    fontWeight: "bold",
    marginBottom: 20,
    color: COLORS.text.text,
  },
  treatmentsContainer: {
    flex: 1,
  },
  treatmentCardLarge: {
    backgroundColor: COLORS.background.white,
    padding: 16,
    borderRadius: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.button.choose,
  },
  treatmentCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  treatmentName: {
    fontWeight: "bold",
    fontSize: 18,
    color: COLORS.text.text,
    flex: 1,
    paddingRight: 10,
  },
  statusIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  treatmentDate: {
    fontSize: 15,
    color: COLORS.text.default,
    marginBottom: 16,
  },
  treatmentFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  viewDetailButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.background.lightBlue,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
  },
  viewDetailText: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.button.choose,
    marginRight: 4,
  },
  statusBadge: {
    fontSize: 13,
    fontWeight: "500",
    color: COLORS.text.status,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
  },
  noDataText: {
    fontSize: 15,
    color: COLORS.text.default,
    fontStyle: "italic",
    textAlign: "center",
    padding: 16,
  },
  noDataContainer: {
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
    backgroundColor: COLORS.background.lightBlue,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border.input,
    marginVertical: 8,
  },
  loadingSectionContainer: {
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    backgroundColor: COLORS.background.lightBlue,
    borderRadius: 12,
  },
  loadingSectionText: {
    marginTop: 15,
    fontSize: 15,
    color: COLORS.text.default,
  },
});

export default TreatmentPage;
