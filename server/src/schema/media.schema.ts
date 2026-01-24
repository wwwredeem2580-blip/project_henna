import { z } from "zod";

// Schema for ImageKit track endpoint
export const imageKitTrackSchema = z.object({
    fileId: z.string({error: () => ({message: 'File ID is required'})}),
    url: z.string({error: () => ({message: 'URL is required'})}),
    filename: z.string({error: () => ({message: 'Filename is required'})}),
    type: z.string({error: () => ({message: 'Type is required'})}).default('profile_picture'),
    status: z.string({error: () => ({message: 'Status is required'})}).default('temp'),
});