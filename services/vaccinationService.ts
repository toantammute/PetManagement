import axios from 'axios';
import { API, PUSH_NOTI } from '@env';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Vaccination } from '../models/models';
import { scheduleNotification } from './scheduleService';

export const getVaccinationsbyPetId = async (petId: string): Promise<Vaccination[]> => {
    const accessToken = await AsyncStorage.getItem('accessToken');
    const response = await axios.get(`${API}/vaccinations/pet/${petId}`, {
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'Authorization': `Bearer ${accessToken}`,
        },
    });
    return response.data;
}

export const createVaccination = async (data: any) => {
    const accessToken = await AsyncStorage.getItem('accessToken');
    const user = await AsyncStorage.getItem('user');
    if (!user) {
        throw new Error('Không tìm thấy thông tin người dùng');
    }
    const user_id = JSON.parse(user).user_id;

    const response = await axios.post(`${API}/vaccinations`, data, {
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'Authorization': `Bearer ${accessToken}`, 
        }  
    });

    if (response.status === 200 || response.status === 201) {
        try {
            // Tạo thông báo nhắc nhở trước 3 ngày
            const nextDueDate = new Date(data.next_due_date);
            const reminderDate = new Date(nextDueDate);
            reminderDate.setDate(reminderDate.getDate() - 3); // Trừ đi 3 ngày
            // Đặt giờ thông báo là 17:00 (5 giờ chiều)
            reminderDate.setHours(17, 0, 0, 0);

            const scheduleData = {
                id: response.data.data.id,
                title: `Nhắc nhở tiêm vaccine: ${data.vaccine_name}`,
                notes: `Đã đến lúc đặt lịch tiêm vaccine ${data.vaccine_name} cho thú cưng của bạn. Ngày tiêm dự kiến: ${data.next_due_date}`,
                reminder_datetime: reminderDate.toISOString(),
                event_repeat: "none",
                end_type: false,
                is_active: true,
                pet_id: data.pet_id,
                end_date: null,
                severity: "normal"
            };

            await scheduleNotification(scheduleData, user_id);
        } catch (error) {
            console.error("Lỗi khi lên lịch thông báo vaccine:", error);
        }
    }

    return response.data;
}
