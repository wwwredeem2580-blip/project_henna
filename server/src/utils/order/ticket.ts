import { Event } from "../../database/event/event";
import { Ticket } from "../../database/ticket/ticket";
import crypto from 'crypto'
import QRCode from 'qrcode'
import ImageKit from 'imagekit'
import dotenv from 'dotenv'
import {v4 as uuidv4} from 'uuid'
dotenv.config();

const imagekit = new ImageKit({
  publicKey: process.env.IMAGEKIT_PUBLIC_KEY!,
  privateKey: process.env.IMAGEKIT_PRIVATE_KEY!,
  urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT!
});

export async function createTicket(order: any, ticketItem: any, index: number) {
  const event = await Event.findById(order.eventId);
  
  if(!event){
    throw new Error('Event not found');
  }
  // Generate unique QR code data
  const ticketNumber = `TKT-${event.title.replace(/\s/g, '-')}-${order.orderNumber}-${uuidv4().substring(0, 6)}`.toUpperCase();
  console.log(ticketNumber);
  const secretHash = crypto.randomBytes(32).toString('hex');
  const qrData = crypto
    .createHash('sha256')
    .update(`${ticketNumber}-${secretHash}-${process.env.QR_SECRET}`)
    .digest('hex');
  
  // Generate QR code image (using 'qrcode' library)
  const qrCodeBuffer = await QRCode.toBuffer(qrData, {
    errorCorrectionLevel: 'H',
    width: 500,
    margin: 2
  });

  const uploadResponse:any = await imagekit.upload({
    file: qrCodeBuffer,
    fileName: `${ticketNumber}.png`,
    folder: `/tickets/${order.eventId.toString()}`
  });

  const qrCodeUrl = uploadResponse?.url;

  
  // Create ticket
  const ticket = await Ticket.create({
    ticketNumber,
    orderId: order._id,
    eventId: order.eventId,
    userId: order.userId,
    ticketVariantId: ticketItem.ticketVariantId,
    eventTitle: event.title,
    eventDate: event?.schedule?.startDate,
    eventVenue: event?.venue?.name,
    ticketType: ticketItem.variantName,
    price: ticketItem.pricePerTicket,
    qrCode: qrData,
    qrCodeUrl: qrCodeUrl,
    status: "valid",
    checkInStatus: "not_checked_in",
    issuedAt: new Date(),
    validUntil: event?.schedule?.endDate,
    secretHash
  });
  
  return ticket;
}