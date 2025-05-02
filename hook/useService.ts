import { useQuery } from "@tanstack/react-query";
import { getServices } from "../services/servicesService";
import { Service } from "../models/models";

export const useServices = () => {
    return useQuery<Service[], Error>({
        queryKey: ['services'],
        queryFn: getServices,
    })
}

