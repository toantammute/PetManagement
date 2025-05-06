import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { addToCart, getCart, getOrderHistory } from '../services/cartService';
import { Cart } from '../models/models';
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

export const useUpdateCart = () => {
    const queryClient = useQueryClient();
    // Implement the update cart mutation here
    return useMutation({
        mutationFn: (variables: { cartId: string; quantity: number }) => 
            addToCart(variables.cartId, variables.quantity),
        onSuccess: () => {
            // Invalidate the cart query to refetch the updated cart
            queryClient.invalidateQueries({ queryKey: ['cart'] });
        },
        onError: (error) => {
            console.error('Failed to update item in cart:', error);
        }
    });
}

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

