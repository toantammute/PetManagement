export interface User {
    id: string;
    username: string;
    full_name: string;
    email: string;
    phone_number: string;
    address: string;
    role: string;
    data_image: string;
}

export interface Image {
    name: string;
    type: string;
    uri: string;
}

export interface Pet {
    petid?: string;
    name: string;
    type: string;
    breed: string;
    age: number;
    birth_date: string;
    weight: number;
    data_image?: string;
    gender: string;
    healthnotes: string;
    microchip_number: string;
}

export interface Diary {
    log_id: string;
    pet_id: string;
    date_time: string;
    notes: string;
    title: string;
    pet_name: string;
    pet_type: string;
    pet_breed: string;
}

export interface Vaccination {
    vaccination_id: string;
    vaccine_name: string;
    pet_id: string;
    date_administered: string;
    next_due_date: string;
}

export interface Product {
    product_id: string;
    name: string;
    price: number;
    stock: number;
    category: string;
    data_image: string;
}

export interface ProductDetail {
    product_id: string;
    name: string;
    price: number;
    stock: number;
    category: string;
    data_image: string;
}

export interface Cart {
    id: string;
    cart_id: string;
    product_id: string;
    product_name: string;
    unit_price: number;
    quantity: number;
    total_price: number;
}

export interface Appointment{
    id: string;
    pet: {
        pet_id: string;
        pet_name: string;
        pet_breed: string;
    }
    owner: {
        owner_name: string;
        owner_number: string;
        owner_email: string;
        owner_address: string;
    }
    service: {
        service_name:string;
        service_duration: number;
        service_amount: number;
    }
    doctor: {
        doctor_id: string;
        doctor_name: string;
    }
    room: string;
    date: string;
    time_slot:{
        start_time: string;
        end_time: string;
    }
    state: string;
    reason: string;
    reminder_send: boolean;
    created_at: string;
    arrival_time: string;
    
}

export interface Schedule {
    id?: string;
    pet_id: number;
    title: string;
    notes: string;
    reminder_datetime: string;
    end_date: string | null;
    end_type: boolean;
    event_repeat: string;
    is_active: boolean;
    created_at?: string;
}

export interface Doctor {
    doctor_id: string;
    username: string;
    doctor_name: string;
    email: string;
    role: string;
    specialization: string;
    year_of_experience: number;
    data_image: string;
    education: string;
    certificate_number: string;
    bio: string;
}

export interface TimeSlot {
    id: string;
    // doctor_id: string;
    start_time: string;
    end_time: string;
    status: string;
}

export interface Service {
    id: string;
    name: string;
    duration: number;
    cost: number;
    category: string;
    notes: string;
    description: string;
}

export interface Order {
    order_id: string;
    total_amount: number;
    payment_status: string;
    order_date: string;
}

export interface OrderDetail {
    id: string;
    user_id: string;
    total_amount: number;
    payment_status: string;
    order_date: string;
    shipping_address: string;
    cart_items: Cart[];
}


export interface ChatResponse {
    message: string;
    data?: any;
    chartData?: any;
    chartType?: string;
    chartTitle?: string;
    sourceDetails?: string;
  }
  
  export interface ErrorResponse {
    error: string;
    details?: string;
  }
  
