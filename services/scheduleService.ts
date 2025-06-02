import axios from 'axios';
import { API_URL, PUSH_NOTI } from "@env";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Schedule } from '../models/models';
console.log('Schedule API_URL', API_URL);

// Thêm hàm gọi API_URL lên lịch thông báo
export const scheduleNotification = async (schedule: Schedule, user_id: string) => {
    console.log("schedule notification");
    console.log("schedule", schedule);
    console.log("API_URL push notification", `${PUSH_NOTI}/scheduleNotification`);
    try {

        const title = schedule.title;
        const body = schedule.notes || "Bạn có một lịch trình cần thực hiện";
        const cronExpression = generateCronExpression(schedule);
        const schedule_id = schedule.id;

        // Thêm thông tin về thời gian kết thúc
        const end_date = schedule.end_type && schedule.end_date ? schedule.end_date : null;

        const response = await axios.post(`${PUSH_NOTI}/scheduleNotification`, {
            user_id,
            title,
            body,
            cronExpression,
            schedule_id,
            end_date // Thêm trường end_date vào request
        });
        console.log("Đã lên lịch thông báo:", response.data);
        return response.data;
    } catch (error) {
        console.error("Lỗi khi lên lịch thông báo:", error);
        throw error;
    }
};

export const cancelScheduleNotification = async (schedule_id: string, user_id: string) => {
    try {
        const response = await axios.delete(`${PUSH_NOTI}/cancelScheduleNotification`, {
            data: {
                user_id,
                schedule_id
            }
        });
        console.log("Đã hủy lịch thông báo:", response.data);
        return response.data;
    } catch (error) {
        console.error("Lỗi khi hủy lịch thông báo:", error);
        throw error;
    }
}

// Hàm chuyển đổi thời gian thành biểu thức cron
const generateCronExpression = (schedule: Schedule) => {
    console.log("generateCronExpression");
    const reminderDate = new Date(schedule.reminder_datetime);
    const minute = reminderDate.getMinutes();
    const hour = reminderDate.getHours();
    const dayOfMonth = reminderDate.getDate();
    const month = reminderDate.getMonth() + 1;

    // Mặc định là chạy một lần
    let cronExpression = `${minute} ${hour} ${dayOfMonth} ${month} *`;

    // Nếu có lặp lại
    if (schedule.event_repeat !== "none") {
        switch (schedule.event_repeat) {
            case "daily":
                cronExpression = `${minute} ${hour} * * *`;
                break;
            case "weekly":
                const dayOfWeek = reminderDate.getDay();
                cronExpression = `${minute} ${hour} * * ${dayOfWeek}`;
                break;
            case "monthly":
                cronExpression = `${minute} ${hour} ${dayOfMonth} * *`;
                break;
            default:
                break;
        }
    }

    console.log(cronExpression);

    return cronExpression;
};

export const getSchedulebyUser = async (): Promise<Schedule[]> => {
    const accessToken = await AsyncStorage.getItem('accessToken');
    const response = await axios.get(`${API_URL}/schedules`, {
        headers: {
            'Authorization': `Bearer ${accessToken}`
        }
    })
    
    if (!response.data.data) {
        return [];
    }
    
    const allSchedules = response.data.data.flatMap((pet: any) => pet.schedules || []);
    return allSchedules;
}

export const createSchedule = async (schedule: Schedule) => {
    console.log(schedule);
    const accessToken = await AsyncStorage.getItem('accessToken');
    const response = await axios.post(`${API_URL}/schedules`, schedule, {
        headers: {
            'Authorization': `Bearer ${accessToken}`
        }
    });
    console.log(response.data);
    console.log(response.status);
    console.log(response.data.message);
    const user = await AsyncStorage.getItem('user');
    if (!user) {
        throw new Error('Không tìm thấy thông tin người dùng');
    }
    const user_id = JSON.parse(user).user_id;
    console.log("user_id", user_id);
    // Lên lịch thông báo sau khi tạo schedule thành công
    if (response.status === 200) {
        console.log("Lên lịch thông báo");
        console.log("user_id", user_id);
        console.log("scheduleid", response.data.data.id);
        if (user_id) {
            try {
                console.log("vào try của createSchedule");
                await scheduleNotification(
                    response.data.data,
                    user_id
                );
            } catch (error) {
                console.error("Không thể lên lịch thông báo:", error);
            }
        }
    }

    return response.data;
}

export const updateSchedule = async (schedule: Schedule & { id: string }) => {
    const accessToken = await AsyncStorage.getItem('accessToken');
    const response = await axios.put(`${API_URL}/schedules/${schedule.id}`, schedule, {
        headers: {
            'Authorization': `Bearer ${accessToken}`
        }
    });

    const user = await AsyncStorage.getItem('user');
    if (!user) {
        throw new Error('Không tìm thấy thông tin người dùng');
    }
    const user_id = JSON.parse(user).user_id;
    console.log("user_id", user_id);
    // Lên lịch thông báo sau khi tạo schedule thành công
    if (response.status === 200) {
        console.log("Lên lịch thông báo");
        console.log("user_id", user_id);
        console.log("scheduleid", response.data.data.id);
        if (user_id) {
            try {
                console.log("vào try của createSchedule");
                await scheduleNotification(
                    response.data.data,
                    user_id
                );
            } catch (error) {
                console.error("Không thể lên lịch thông báo:", error);
            }
        }
    }

    return response.data;
}

export const deleteSchedule = async (schedule_id: string) => {
    const accessToken = await AsyncStorage.getItem('accessToken');
    const user = await AsyncStorage.getItem('user');
    if (!user) {
        throw new Error('Không tìm thấy thông tin người dùng');
    }
    const user_id = JSON.parse(user).user_id;
    const response = await axios.delete(`${API_URL}/schedules/${schedule_id}`, {
        headers: {
            'Authorization': `Bearer ${accessToken}`
        }
    });
    if (response.status === 200) {
        console.log("Hủy lịch thông báo");
        await cancelScheduleNotification(schedule_id, user_id);
        return response.data;
    }
    return response.data;
}

export const toggleSchedule = async (schedule_id: string, is_active: boolean) => {
    console.log("toggleSchedule", schedule_id, is_active);
    const accessToken = await AsyncStorage.getItem('accessToken');
    const user = await AsyncStorage.getItem('user');
    if (!user) {
        throw new Error('Không tìm thấy thông tin người dùng');
    }
    const user_id = JSON.parse(user).user_id;

    const response = await axios.put(
        `${API_URL}/schedules/${schedule_id}/activate`,
        { is_active },
        {
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json'
            }
        }
    );

    if (response.status === 200) {
        try {
            if (is_active) {
                // Nếu kích hoạt schedule, lên lịch thông báo mới
                await scheduleNotification(response.data.data, user_id);
            } else {
                // Nếu vô hiệu hóa schedule, hủy thông báo
                await cancelScheduleNotification(schedule_id, user_id);
            }
        } catch (error) {
            console.error("Lỗi khi xử lý thông báo:", error);
        }
    }

    return response.data;
}