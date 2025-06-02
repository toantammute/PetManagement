import axios from 'axios';
import { API_URL, PUSH_NOTI } from '@env';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Vaccination } from '../models/models';
console.log('Vaccination API_URL', API_URL);

const generateCronExpression = (date: Date) => {
    console.log("generateCronExpression");
    const reminderDate = new Date(date);
    // Chỉ gửi một lần vào ngày và giờ cụ thể
    return `${0} ${10} ${reminderDate.getDate()} ${reminderDate.getMonth() + 1} *`; // gửi vào 10h sáng ngày hôm đó
};

export const scheduleVaccination = async (vaccination: Vaccination, user_id: string) => {
    console.log("schedule vaccination");
    console.log("vaccination", vaccination);
    console.log("API_URL push notification", `${PUSH_NOTI}/scheduleVaccine`);
    try {
        const reminderDate = new Date(vaccination.next_due_date);
        reminderDate.setDate(reminderDate.getDate() - 1); // Trừ đi 1 ngày
        const next_due_date_cron = generateCronExpression(reminderDate);
        console.log("vaccination", vaccination);

        const response = await axios.post(`${PUSH_NOTI}/scheduleVaccine`, {
            user_id,
            next_due_date_cron,
            pet_id: vaccination.pet_id,
            vaccination_id: vaccination.vaccination_id,
            vaccine_name: vaccination.vaccine_name,
            date_administered: vaccination.date_administered,
            next_due_date: vaccination.next_due_date
        });
        console.log("Đã lên lịch thông báo:", response.data);
        return response.data;
    } catch (error) {
        console.error("Lỗi khi lên lịch thông báo:", error);
        throw error;
    }
};

export const getVaccinationsbyPetId = async (petId: string): Promise<Vaccination[]> => {
    const accessToken = await AsyncStorage.getItem('accessToken');
    const response = await axios.get(`${API_URL}/vaccinations/pet/${petId}`, {
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
    console.log("vaccination data: ", data);

    const response = await axios.post(`${API_URL}/vaccination/create`, data, {
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'Authorization': `Bearer ${accessToken}`, 
        }  
    });
    console.log("vaccination response: ", response.data);

    if (response.status === 200 || response.status === 201) {
        try {
            // Kiểm tra next_due_date có giá trị hợp lệ không
            if (data.next_due_date && data.next_due_date !== "0001-01-01T00:00:00Z") {
                await scheduleVaccination(response.data, user_id);
            }
        } catch (error) {
            console.error("Lỗi khi lên lịch thông báo vaccine:", error);
        }
    }

    return response.data;
}
