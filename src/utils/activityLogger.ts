import mongoose from 'mongoose';
import { ActivityModel } from './Activity';
import { checkUpdate } from './checkUpdate';

// Define the interface for the activity data
interface ActivityData {
    userId: string;
    remarks: string;
    timestamp: Date;
    mutateTable: string;
    content: string;
    status: boolean;
}

export const logProfileActivity = async (
    userId: string,
    previousData: Record<string, any>,
    action: 'created' | 'updated',
    profileData: Record<string, any>,
    activityTable: string
): Promise<void> => {
    try {
        // Fetch the changes between previous data and updated data
        const changes = await checkUpdate(previousData, profileData);

        // Prepare the activity data
        const activityData: ActivityData = {
            userId,
            remarks: `${action}`,
            timestamp: new Date(),
            mutateTable: activityTable,
            content: JSON.stringify(changes), // Ensure `changes` can be converted to JSON
            status: true, // Assume all activities are valid for now
        };

        // Create a new ActivityModel instance with activity data
        const activityInstance = new ActivityModel(activityData);
        await activityInstance.save();
        
        console.log(`Profile ${action} activity logged successfully:`, activityInstance);
    } catch (error) {
        console.error(`Error logging profile ${action} activity:`, error);
        // Optionally, you might want to throw the error here to handle it in the calling function
        // throw error;
    }
};
