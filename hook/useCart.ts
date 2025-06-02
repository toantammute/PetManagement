import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { addToCart, getCart, getOrderHistory, removeFromCart, createOrder, getOrdersByUser, getOrdersById, generateQRCode } from '../services/cartService';
import { Cart, Order, OrderDetail, QRRequest, QRResponse } from '../models/models';
import { use } from 'react';


export const useCart = () => {
    return useQuery<Cart[], Error>({
        queryKey: ['cart'],
        queryFn: getCart,
        refetchOnWindowFocus: true,
        retry: 3,
        retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
        throwOnError: (error: Error, query) => {
            console.error('Failed to fetch cart:', error);
            return false;
        },
        select: (data) => {
            return data.sort((a, b) => a.product_name.localeCompare(b.product_name));
        }
    });
}


export const useAddToCart = () => {
    const queryClient = useQueryClient();
    // Implement the add to cart mutation here
    return useMutation({
        mutationFn: (variables: { productId: string; quantity: number }) => 
            addToCart(variables.productId, variables.quantity),
        onSuccess: () => {
            // Invalidate the cart query to refetch the updated cart
            queryClient.invalidateQueries({ queryKey: ['cart'] });
        },
        onError: (error) => {
            console.error('Failed to add item to cart:', error);
        }
    });
};

export const useRemoveFromCart = () => {
    return useMutation({
        mutationFn: (product_id: string) => removeFromCart(product_id),
    });
};

export const useCreateOrder = () => {
    return useMutation({
        mutationFn: () => createOrder(),
    });
};


export const useGetOrdersById = (id: string) => {
    return useQuery<OrderDetail, Error>({
        queryKey: ['ordersById', id],
        queryFn:() => getOrdersById(id),
        enabled: !!id,
    });
};

export const useGetOrdersByUser = () => {
    return useQuery<OrderDetail[], Error>({
        queryKey: ['ordersByUser'],
        queryFn: getOrdersByUser,
    });
};


export const useOrderHistory = () => {
    const queryClient = useQueryClient();
    return useQuery({
        queryKey: ['orderHistory'],
        queryFn: getOrderHistory,
        refetchOnWindowFocus: true,
        retry: 3,
        retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
        throwOnError: (error: Error, query) => {
            console.error('Failed to fetch order history:', error);
            return false;
        }
    });
}

export const useGenerateQR = () => {
    return useMutation<QRResponse, Error, QRRequest>({
        mutationFn: (qrData: QRRequest) => generateQRCode(qrData),
        onError: (error) => {
            console.error('Failed to generate QR code:', error);
        }
    });
};



