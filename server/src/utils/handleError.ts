import { ZodError } from 'zod';
import { Response } from 'express';
import { MongooseError } from 'mongoose';

export const handleError = (error: any, res: Response) => {
    if(error instanceof ZodError){
      return res.status(400).json({
        success: false,
        message: error.issues[0]?.message
      })
    }

    if(error.code === 11000){
      return res.status(409).json({
        success: false,
        message: "User already exists"
      })
    }

    if(error.status && error.status !== 500){
      return res.status(error.status).json({
        success: false,
        message: error.message
      })
    }

    if(error instanceof MongooseError){
      console.log("DB error")
      console.log(error)
      return res.status(500).json({
        success: false,
        message: "Something went wrong"
      })
    }

    console.log(error)
    return res.status(500).json({
      success: false,
      message: "Something went wrong"
    });
    
}