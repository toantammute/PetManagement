import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ImageBackground } from 'react-native';
import { usePets, usePetById } from '../../hook/usePets';
import { useNavigation } from '@react-navigation/native';
import AvaBtn from '../../component/avabtn';
import { COLORS } from '../../theme/color';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useCart } from '../../hook/useCart';
import { useAppointments } from '../../hook/useAppointment';
import { useDiarybyUser } from '../../hook/useDiary';

interface PetAvatarItemProps {
  petId: string;
}

const PetAvatarItem: React.FC<PetAvatarItemProps> = ({ petId }) => {
  const { data: pet } = usePetById(petId);
  const navigation = useNavigation<any>();
  
  // Xử lý dữ liệu hình ảnh base64
  const getImageSource = (dataImage?: string) => {
    if (!dataImage) return undefined;
    
    // Kiểm tra xem dữ liệu đã có tiền tố data:image chưa
    if (dataImage.startsWith('data:image')) {
      return dataImage;
    }
    // Nếu là chuỗi base64 thuần, thêm tiền tố
    return `data:image/jpeg;base64,${dataImage}`;
  };

  return (
    <View style={styles.petItem}>
      <AvaBtn
        variant={pet?.data_image ? 'default' : 'noava'}
        imageUrl={getImageSource(pet?.data_image)}
        petName={pet?.name || ''}
        size={60}
        onPress={() => navigation.navigate('PetDetail', { id: petId })}
      />
    </View>
  );
};

const Home = () => {
  const navigation = useNavigation<any>();
  const { data: pets, isLoading: isLoadingPets } = usePets();
  const { data: cartItems } = useCart();
  const { data: appointments, isLoading: isLoadingAppointments } = useAppointments();
  const { data: diaryEntries, isLoading: isLoadingDiaries } = useDiarybyUser();
  
  // Giới hạn số lượng pet hiển thị (tối đa 4 pet)
  const limitedPets = pets?.slice(0, 4);
  
  // Lấy 3 bản ghi nhật ký mới nhất
  const latestDiaries = diaryEntries ? 
    [...diaryEntries]
      .sort((a, b) => new Date(b.date_time).getTime() - new Date(a.date_time).getTime())
      .slice(0, 3) 
    : [];
    
  // Định dạng ngày tháng cho nhật ký
  const formatDiaryDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Chuyển đổi sang múi giờ Việt Nam và định dạng ngày tháng
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    // Chuyển sang múi giờ +7 (Việt Nam)
    const vietnamTime = new Date(date.getTime() + (7 * 60 * 60 * 1000));
    return vietnamTime.toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Lọc danh sách lịch hẹn sắp tới
  const upcomingAppointments = appointments 
    ? appointments
        .filter(appointment => {
          const today = new Date();
          const appointmentDate = new Date(appointment.date);
          return appointmentDate >= today && appointment.state !== 'CANCELLED';
        })
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
        .slice(0, 2)
    : [];

  // Danh sách các danh mục sản phẩm
  const productCategories = [
    { id: 1, name: 'Thú cưng', icon: 'pets', color: '#FF6B6B', screen: 'PetProducts' },
    { id: 2, name: 'Phụ kiện', icon: 'shopping-bag', color: '#4ECDC4', screen: 'AccessoryList' },
    { id: 3, name: 'Thức ăn', icon: 'restaurant', color: '#FFD93D', screen: 'FoodList' },
    { id: 4, name: 'Dịch vụ', icon: 'spa', color: '#95E1D3', screen: 'ServiceList' }
  ];
  
  return (
    <View style={styles.container}>
      {/* Header với welcome và cart */}
      <View style={styles.header}>
        <View style={styles.welcomeContainer}>
          <Text style={styles.welcomeText}>Xin chào!</Text>
          <Text style={styles.welcomeSubText}>Chào mừng bạn đến với PetShop</Text>
        </View>
        <TouchableOpacity 
          style={styles.cartButton}
          onPress={() => navigation.navigate('Cart')}
        >
          <Icon name="shopping-cart" size={24} color="#333" />
          {cartItems && cartItems.length > 0 && (
            <View style={styles.cartBadge}>
              <Text style={styles.cartBadgeText}>{cartItems.length}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>
      
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Phần hiển thị thú cưng */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Thú cưng của bạn</Text>
            <TouchableOpacity onPress={() => navigation.navigate('Pets')}>
              <Text style={styles.seeAllText}>Xem tất cả</Text>
            </TouchableOpacity>
          </View>
          
          {isLoadingPets ? (
            <Text style={styles.loadingText}>Đang tải...</Text>
          ) : (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.petList}>
              <TouchableOpacity 
                style={styles.addPetButton}
                onPress={() => navigation.navigate('AddPet')}
              >
                <Icon name="add" size={30} color={COLORS.background.mint} />
                <Text style={styles.addPetText}>Thêm</Text>
              </TouchableOpacity>
              {limitedPets?.map(pet => (
                pet.petid ? <PetAvatarItem key={pet.petid} petId={pet.petid} /> : null
              ))}
            </ScrollView>
          )}
        </View>

        {/* Phần hiển thị danh mục sản phẩm */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Mua sắm</Text>
            <TouchableOpacity onPress={() => navigation.navigate('AllProducts')}>
              <Text style={styles.seeAllText}>Xem tất cả</Text>
            </TouchableOpacity>
          </View>
          
          <View style={styles.categoryContainer}>
            {productCategories.map(category => (
              <TouchableOpacity 
                key={category.id}
                style={styles.categoryItem}
                onPress={() => navigation.navigate(category.screen)}
              >
                <View style={[styles.categoryIcon, { backgroundColor: `${category.color}15` }]}>
                  <Icon name={category.icon} size={32} color={category.color} />
                </View>
                <Text style={styles.categoryName}>{category.name}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Section không biết giống thú cưng */}
        <View style={styles.section}>
          <TouchableOpacity 
            style={styles.breedIdentifierCard}
            onPress={() => navigation.navigate('BreedIdentifier')}
          >
            <View style={styles.breedIdentifierContent}>
              <View style={styles.breedIdentifierTextContainer}>
                <Text style={styles.breedIdentifierTitle}>Không biết giống thú cưng của bạn?</Text>
                <Text style={styles.breedIdentifierSubtitle}>
                  Dùng công cụ nhận diện giống để xác định giống thú cưng của bạn
                </Text>
                <View style={styles.breedIdentifierButton}>
                  <Text style={styles.breedIdentifierButtonText}>Nhận diện ngay</Text>
                  <Icon name="arrow-forward" size={16} color="#FFF" />
                </View>
              </View>
              <View style={styles.breedIdentifierIconContainer}>
                <Icon name="pets" size={70} color={COLORS.background.mint} />
              </View>
            </View>
          </TouchableOpacity>
        </View>

        {/* Phần hiển thị lịch hẹn sắp tới */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Lịch hẹn sắp tới</Text>
            <TouchableOpacity onPress={() => navigation.navigate('Appointments')}>
              <Text style={styles.seeAllText}>Xem tất cả</Text>
            </TouchableOpacity>
          </View>
          
          {isLoadingAppointments ? (
            <Text style={styles.loadingText}>Đang tải...</Text>
          ) : upcomingAppointments.length > 0 ? (
            <View>
              {upcomingAppointments.map(appointment => (
                <TouchableOpacity 
                  key={appointment.id}
                  style={styles.appointmentCard}
                  onPress={() => navigation.navigate('AppointmentDetail', { id: appointment.id })}
                >
                  <View style={styles.appointmentCardContent}>
                    <View style={styles.appointmentIconContainer}>
                      <Icon name="event" size={24} color={COLORS.background.mint} />
                    </View>
                    <View style={styles.appointmentInfo}>
                      <Text style={styles.appointmentDate}>{formatDate(appointment.date)}</Text>
                      <Text style={styles.appointmentService}>{appointment.service.service_name}</Text>
                      <View style={styles.appointmentFooter}>
                        <View style={styles.petInfo}>
                          <Icon name="pets" size={16} color="#757575" />
                          <Text style={styles.petInfoText}>{appointment.pet.pet_name}</Text>
                        </View>
                        <View style={[
                          styles.statusBadge,
                          { backgroundColor: appointment.state === 'CONFIRMED' ? '#E8F5E9' : '#FFF3E0' }
                        ]}>
                          <Text style={[
                            styles.statusText,
                            { color: appointment.state === 'CONFIRMED' ? '#2E7D32' : '#E65100' }
                          ]}>
                            {appointment.state === 'CONFIRMED' ? 'Đã xác nhận' : 'Chờ xác nhận'}
                          </Text>
                        </View>
                      </View>
                    </View>
                    <Icon name="chevron-right" size={24} color="#BDBDBD" />
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          ) : (
            <View style={styles.emptyState}>
              <Icon name="event-busy" size={40} color={COLORS.text.textDisable} />
              <Text style={styles.emptyStateText}>Không có lịch hẹn sắp tới</Text>
              <TouchableOpacity 
                style={styles.addButton}
                onPress={() => navigation.navigate('AddAppointment')}
              >
                <Text style={styles.addButtonText}>Đặt lịch hẹn</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Phần hiển thị nhật ký mới nhất */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Nhật ký gần đây</Text>
            <TouchableOpacity onPress={() => navigation.navigate('DiaryList')}>
              <Text style={styles.seeAllText}>Xem tất cả</Text>
            </TouchableOpacity>
          </View>
          
          {isLoadingDiaries ? (
            <Text style={styles.loadingText}>Đang tải...</Text>
          ) : latestDiaries.length > 0 ? (
            <View>
              {latestDiaries.map(diary => (
                <TouchableOpacity 
                  key={diary.log_id}
                  style={styles.diaryCard}
                  onPress={() => navigation.navigate('DiaryDetail', { id: diary.log_id })}
                >
                  <View style={styles.diaryCardContent}>
                    <View style={styles.diaryIconContainer}>
                      <Icon name="event-note" size={24} color={COLORS.background.mint} />
                    </View>
                    <View style={styles.diaryInfo}>
                      <View style={styles.diaryHeader}>
                        <Text style={styles.diaryTitle}>{diary.title}</Text>
                        <Text style={styles.diaryDate}>{formatDiaryDate(diary.date_time)}</Text>
                      </View>
                      <Text numberOfLines={2} style={styles.diaryNote}>{diary.notes}</Text>
                      <View style={styles.diaryPetInfo}>
                        <Icon name="pets" size={16} color="#757575" />
                        <Text style={styles.diaryPetName}>{diary.pet_name}</Text>
                      </View>
                    </View>
                    <Icon name="chevron-right" size={24} color="#BDBDBD" />
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          ) : (
            <View style={styles.emptyState}>
              <Icon name="book" size={40} color={COLORS.text.textDisable} />
              <Text style={styles.emptyStateText}>Chưa có bản ghi nhật ký nào</Text>
              <TouchableOpacity 
                style={styles.addButton}
                onPress={() => navigation.navigate('AddLog')}
              >
                <Text style={styles.addButtonText}>Thêm nhật ký</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingTop: 10,
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  welcomeContainer: {
    flex: 1,
  },
  welcomeText: {
    fontSize: 22,
    fontWeight: 'bold',
    color: COLORS.text.text,
  },
  welcomeSubText: {
    fontSize: 14,
    color: COLORS.text.textDisable,
    marginTop: 2,
  },
  cartButton: {
    position: 'relative',
    padding: 8,
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
  },
  cartBadge: {
    position: 'absolute',
    top: -5,
    right: -5,
    backgroundColor: COLORS.background.mint,
    borderRadius: 10,
    minWidth: 18,
    height: 18,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#FFF',
  },
  cartBadgeText: {
    color: '#FFF',
    fontSize: 10,
    fontWeight: 'bold',
  },
  section: {
    marginBottom: 16,
    paddingHorizontal: 16,
    paddingVertical: 4,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text.text,
  },
  seeAllText: {
    fontSize: 14,
    color: COLORS.background.mint,
  },
  petList: {
    flexDirection: 'row',
    paddingVertical: 5,
  },
  petItem: {
    marginRight: 12,
  },
  loadingText: {
    fontSize: 16,
    color: COLORS.text.textDisable,
    textAlign: 'center',
    marginVertical: 20,
  },
  addPetButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: COLORS.background.mint,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  addPetText: {
    fontSize: 10,
    color: COLORS.background.mint,
    marginTop: 3,
  },
  // Shopping categories styles
  categoryContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 4,
    paddingVertical: 4,
  },
  categoryItem: {
    width: '23%',
    alignItems: 'center',
    marginBottom: 8,
  },
  categoryIcon: {
    width: 60,
    height: 60,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 6,
    borderWidth: 1,
    borderColor: '#F0F0F0',
  },
  categoryName: {
    fontSize: 13,
    textAlign: 'center',
    color: COLORS.text.text,
    fontWeight: '500',
  },
  // Appointment styles
  appointmentCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginBottom: 8,
    padding: 0,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#F0F0F0',
  },
  appointmentCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  appointmentIconContainer: {
    marginRight: 12,
  },
  appointmentInfo: {
    flex: 1,
  },
  appointmentDate: {
    fontSize: 14,
    color: COLORS.text.textDisable,
    marginBottom: 4,
  },
  appointmentService: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text.text,
    marginBottom: 8,
  },
  appointmentFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  petInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  petInfoText: {
    fontSize: 14,
    color: COLORS.text.textDisable,
    marginLeft: 4,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  emptyState: {
    alignItems: 'center',
    padding: 24,
    backgroundColor: '#F9F9F9',
    borderRadius: 12,
  },
  emptyStateText: {
    fontSize: 16,
    color: COLORS.text.textDisable,
    marginVertical: 12,
  },
  addButton: {
    backgroundColor: COLORS.background.mint,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginTop: 8,
  },
  addButtonText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '500',
  },
  // Thêm style cho breed identifier card
  breedIdentifierCard: {
    backgroundColor: '#F8F9FA',
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#E9ECEF',
  },
  breedIdentifierContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
  },
  breedIdentifierTextContainer: {
    flex: 1,
    paddingRight: 12,
  },
  breedIdentifierTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.text.text,
    marginBottom: 6,
  },
  breedIdentifierSubtitle: {
    fontSize: 13,
    color: COLORS.text.textDisable,
    marginBottom: 8,
    lineHeight: 16,
  },
  breedIdentifierButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.background.mint,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignSelf: 'flex-start',
    gap: 8,
  },
  breedIdentifierButtonText: {
    color: '#FFF',
    fontSize: 13,
    fontWeight: '600',
  },
  breedIdentifierIconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 80,
    height: 80,
  },
  // Support card styles
  supportCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#E9ECEF',
  },
  supportCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  supportIconContainer: {
    marginRight: 12,
  },
  supportTextContainer: {
    flex: 1,
  },
  supportTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.text.text,
    marginBottom: 8,
  },
  supportDescription: {
    fontSize: 13,
    color: COLORS.text.textDisable,
    marginBottom: 12,
    lineHeight: 18,
  },
  supportButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.background.mint,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignSelf: 'flex-start',
    gap: 8,
  },
  supportButtonText: {
    color: '#FFF',
    fontSize: 13,
    fontWeight: '600',
  },
  diaryCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginBottom: 8,
    padding: 0,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#F0F0F0',
  },
  diaryCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  diaryIconContainer: {
    marginRight: 12,
  },
  diaryInfo: {
    flex: 1,
  },
  diaryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  diaryTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.text.text,
  },
  diaryDate: {
    fontSize: 14,
    color: COLORS.text.textDisable,
  },
  diaryNote: {
    fontSize: 14,
    color: COLORS.text.textDisable,
    marginBottom: 4,
  },
  diaryPetInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  diaryPetName: {
    fontSize: 14,
    color: COLORS.text.textDisable,
    marginLeft: 4,
  },
});

export default Home;
