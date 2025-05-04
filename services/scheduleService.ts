import axios from 'axios';
import { API, PUSH_NOTI} from "@env";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Schedule } from '../models/models';

// Thêm hàm gọi API lên lịch thông báo
export const scheduleNotification = async (schedule: Schedule, user_id: string) => {
    console.log("schedule notification");
    console.log("schedule", schedule);
    console.log("api push notification", `${PUSH_NOTI}/scheduleNotification`);
    try {
        
        const title = schedule.title;
        const body = schedule.notes || "Bạn có một lịch trình cần thực hiện";
        const cronExpression = generateCronExpression(schedule);
        const schedule_id = schedule.id;
        

        const response = await axios.post(`${PUSH_NOTI}/scheduleNotification`, {
            user_id,
            title,
            body,
            cronExpression,
            schedule_id
        });
        console.log("Đã lên lịch thông báo:", response.data);
        return response.data;
    } catch (error) {
        console.error("Lỗi khi lên lịch thông báo:", error);
        throw error;
    }
};

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
    const response = await axios.get(`${API}/schedules`, {
        headers: {
            'Authorization': `Bearer ${accessToken}`
        }
    })
    const allSchedules = response.data.data.flatMap((pet: any) => pet.schedules);
    return allSchedules;
}

export const createSchedule = async (schedule: Schedule) => {
    console.log(schedule);
    const accessToken = await AsyncStorage.getItem('accessToken');
    const response = await axios.post(`${API}/schedules`, schedule, {
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
    const response = await axios.put(`${API}/schedules/${schedule.id}`, schedule, {
        headers: {
            'Authorization': `Bearer ${accessToken}`
        }
    });
    
    // Cập nhật lịch thông báo sau khi cập nhật schedule
    if (response.data) {
        const user_id = await AsyncStorage.getItem('userId');
        if (user_id) {
            try {
                await scheduleNotification(schedule, user_id);
            } catch (error) {
                console.error("Không thể cập nhật lịch thông báo:", error);
            }
        }
    }
    
    return response.data;
}

export const deleteSchedule = async (id: string) => {
    const accessToken = await AsyncStorage.getItem('accessToken');
    const response = await axios.delete(`${API}/schedules/${id}`, {
        headers: {
            'Authorization': `Bearer ${accessToken}`
        }
    });
    return response.data;
}


