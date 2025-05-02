import { useQuery } from '@tanstack/react-query';
import { getCart } from '../services/cartService';
import { Cart } from '../models/models';

export const useCart = () => {
    return useQuery<Cart[], Error>({
        queryKey: ['cart'],
        queryFn: getCart,
        // staleTime: 5 * 60 * 1000,
        // gcTime: 30 * 60 * 1000,
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

