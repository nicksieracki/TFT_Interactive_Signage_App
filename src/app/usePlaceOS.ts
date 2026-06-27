import { useContext } from 'react';
import { PlaceOSContext } from './PlaceOSContext';

const usePlaceOS = () => {
    const ctx = useContext(PlaceOSContext);
    if (!ctx) throw new Error('usePlaceOS must be used within PlaceOSProvider');
    return ctx;
};

export const usePlaceOSSystems = () => {
    const { systems, systemsLoading, systemsError } = usePlaceOS();
    return { data: systems, isLoading: systemsLoading, isError: !!systemsError, error: systemsError };
};