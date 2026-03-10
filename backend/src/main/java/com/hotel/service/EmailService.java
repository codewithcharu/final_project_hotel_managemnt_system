package com.hotel.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import org.springframework.scheduling.annotation.Async;

@Service
public class EmailService {

    @Autowired
    private JavaMailSender mailSender;

    @Async
    public void sendOTPEmail(String to, String otp) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setTo(to);
            helper.setFrom("infopiyakaru@gmail.com");
            helper.setSubject("Piyakaru Hotel - Email Verification OTP");

            String htmlContent = """
                    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                        <h2 style="color: #333;">Email Verification</h2>
                        <p>Thank you for registering with Piyakaru Hotel!</p>
                        <p>Your verification code is:</p>
                        <div style="background: #f0f0f0; padding: 20px; text-align: center; font-size: 32px; font-weight: bold; letter-spacing: 5px; margin: 20px 0;">
                            %s
                        </div>
                        <p>This code will expire in 10 minutes.</p>
                        <p>If you didn't request this code, please ignore this email.</p>
                    </div>
                    """
                    .formatted(otp);

            helper.setText(htmlContent, true);
            mailSender.send(message);
        } catch (MessagingException e) {
            throw new RuntimeException("Failed to send email", e);
        }
    }

    @Async
    public void sendStaffCredentials(String to, String name, String password, String role) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setFrom("infopiyakaru@gmail.com");
            helper.setTo(to);
            helper.setSubject("Piyakaru Hotel - Your Account Credentials");

            String roleName = "kitchen_admin".equals(role) ? "Kitchen Admin" : "Staff";

            String htmlContent = """
                    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                        <div style="background: linear-gradient(135deg, #0b132b 0%%, #1c2541 100%%); color: #fff; padding: 30px; border-radius: 10px 10px 0 0;">
                            <h2 style="margin: 0; color: #fff;">Welcome to Piyakaru Hotel</h2>
                        </div>
                        <div style="background: #fff; padding: 30px; border: 1px solid #e0e0e0; border-top: none; border-radius: 0 0 10px 10px;">
                            <p style="color: #333; font-size: 16px;">Hello %s,</p>
                            <p style="color: #333;">Your %s account has been created successfully. Please use the following credentials to log in:</p>

                            <div style="background: #f9fafb; border: 2px solid #e0e0e0; border-radius: 8px; padding: 20px; margin: 20px 0;">
                                <p style="margin: 10px 0; color: #333;"><strong>Email:</strong> %s</p>
                                <p style="margin: 10px 0; color: #333;"><strong>Password:</strong> <span style="font-family: monospace; font-size: 18px; font-weight: bold; color: #0b132b; background: #fff; padding: 5px 10px; border-radius: 4px; display: inline-block;">%s</span></p>
                            </div>

                            <p style="color: #666; font-size: 14px; margin-top: 30px;">
                                <strong>Important:</strong> Please change your password after your first login for security purposes.
                            </p>
                        </div>
                    </div>
                    """
                    .formatted(name, roleName, to, password);

            helper.setText(htmlContent, true);
            mailSender.send(message);
        } catch (MessagingException e) {
            throw new RuntimeException("Failed to send email", e);
        }
    }

    @Async
    public void sendReservationApprovedEmail(String to, String guestName, String reservationType,
            String reservationDetails) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setFrom("infopiyakaru@gmail.com");
            helper.setTo(to);
            helper.setSubject("Piyakaru Hotel - Reservation Successful");

            String htmlContent = """
                    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                        <div style="background: linear-gradient(135deg, #0b132b 0%%, #1c2541 100%%); color: #fff; padding: 30px; border-radius: 10px 10px 0 0;">
                            <h2 style="margin: 0; color: #fff;">✓ Reservation Successful!</h2>
                        </div>
                        <div style="background: #fff; padding: 30px; border: 1px solid #e0e0e0; border-top: none; border-radius: 0 0 10px 10px;">
                            <p style="color: #333; font-size: 16px;">Dear %s,</p>
                            <p style="color: #333;">We are pleased to inform you that your <strong>%s reservation</strong> is successful!</p>

                            <div style="background: #e8f5e9; border-left: 4px solid #4caf50; padding: 15px; margin: 20px 0;">
                                <h3 style="margin: 0 0 10px 0; color: #2e7d32;">Reservation Details:</h3>
                                <p style="margin: 5px 0; color: #333;">%s</p>
                            </div>

                            <p style="color: #333;">Your booking is confirmed and we look forward to welcoming you!</p>
                            <p style="color: #666; font-size: 14px; margin-top: 30px;">
                                If you have any questions, please don't hesitate to contact us.
                            </p>
                            <p style="color: #666; font-size: 14px;">Best regards,<br>Piyakaru Hotel Team</p>
                        </div>
                    </div>
                    """
                    .formatted(guestName, reservationType, reservationDetails);

            helper.setText(htmlContent, true);
            mailSender.send(message);
        } catch (MessagingException e) {
            throw new RuntimeException("Failed to send email", e);
        }
    }

    @Async
    public void sendReservationCancelledEmail(String to, String guestName, String reservationType,
            String reservationDetails, String reason) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setFrom("infopiyakaru@gmail.com");
            helper.setTo(to);
            helper.setSubject("Piyakaru Hotel - Reservation Cancelled");

            String reasonText = (reason != null && !reason.isEmpty())
                    ? "<p style='margin: 5px 0; color: #333;'><strong>Reason:</strong> " + reason + "</p>"
                    : "";

            String htmlContent = """
                    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                        <div style="background: linear-gradient(135deg, #c62828 0%%, #b71c1c 100%%); color: #fff; padding: 30px; border-radius: 10px 10px 0 0;">
                            <h2 style="margin: 0; color: #fff;">Reservation Cancelled</h2>
                        </div>
                        <div style="background: #fff; padding: 30px; border: 1px solid #e0e0e0; border-top: none; border-radius: 0 0 10px 10px;">
                            <p style="color: #333; font-size: 16px;">Dear %s,</p>
                            <p style="color: #333;">We regret to inform you that your <strong>%s reservation</strong> could not be fulfilled and has been cancelled.</p>

                            <div style="background: #ffebee; border-left: 4px solid #f44336; padding: 15px; margin: 20px 0;">
                                <h3 style="margin: 0 0 10px 0; color: #c62828;">Reservation Details:</h3>
                                <p style="margin: 5px 0; color: #333;">%s</p>
                                %s
                            </div>

                            <p style="color: #333;">We sincerely apologize for any inconvenience this may have caused. Please feel free to make a new reservation or contact us for alternative arrangements.</p>
                            <p style="color: #666; font-size: 14px; margin-top: 30px;">
                                If you have any questions, please contact us immediately.
                            </p>
                            <p style="color: #666; font-size: 14px;">Best regards,<br>Piyakaru Hotel Team</p>
                        </div>
                    </div>
                    """
                    .formatted(guestName, reservationType, reservationDetails, reasonText);

            helper.setText(htmlContent, true);
            mailSender.send(message);
        } catch (MessagingException e) {
            throw new RuntimeException("Failed to send email", e);
        }
    }

    @Async
    public void sendReservationUpdatedEmail(String to, String guestName, String reservationType,
            String oldDetails, String newDetails) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setFrom("infopiyakaru@gmail.com");
            helper.setTo(to);
            helper.setSubject("Piyakaru Hotel - Reservation Updated");

            String htmlContent = """
                    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                        <div style="background: linear-gradient(135deg, #0b132b 0%%, #1c2541 100%%); color: #fff; padding: 30px; border-radius: 10px 10px 0 0;">
                            <h2 style="margin: 0; color: #fff;">Reservation Updated</h2>
                        </div>
                        <div style="background: #fff; padding: 30px; border: 1px solid #e0e0e0; border-top: none; border-radius: 0 0 10px 10px;">
                            <p style="color: #333; font-size: 16px;">Dear %s,</p>
                            <p style="color: #333;">Your <strong>%s reservation</strong> has been updated by our team.</p>

                            <div style="background: #fff3e0; border-left: 4px solid #ff9800; padding: 15px; margin: 20px 0;">
                                <h3 style="margin: 0 0 10px 0; color: #e65100;">Updated Reservation Details:</h3>
                                <p style="margin: 5px 0; color: #333;">%s</p>
                            </div>

                            <p style="color: #333;">Please review the updated details above. If you have any concerns or questions about these changes, please contact us immediately.</p>
                            <p style="color: #666; font-size: 14px; margin-top: 30px;">
                                Thank you for choosing Piyakaru Hotel.
                            </p>
                            <p style="color: #666; font-size: 14px;">Best regards,<br>Piyakaru Hotel Team</p>
                        </div>
                    </div>
                    """
                    .formatted(guestName, reservationType, newDetails);

            helper.setText(htmlContent, true);
            mailSender.send(message);
        } catch (MessagingException e) {
            throw new RuntimeException("Failed to send email", e);
        }
    }

    @Async
    public void sendInquiryReplyEmail(String to, String name, String originalMessage, String replyMessage) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setFrom("infopiyakaru@gmail.com");
            helper.setTo(to);
            helper.setSubject("Piyakaru Hotel - Response to your Inquiry");

            String htmlContent = """
                    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                        <div style="background: linear-gradient(135deg, #0b132b 0%%, #1c2541 100%%); color: #fff; padding: 30px; border-radius: 10px 10px 0 0;">
                            <h2 style="margin: 0; color: #fff;">Inquiry Response</h2>
                        </div>
                        <div style="background: #fff; padding: 30px; border: 1px solid #e0e0e0; border-top: none; border-radius: 0 0 10px 10px;">
                            <p style="color: #333; font-size: 16px;">Dear %s,</p>
                            <p style="color: #333;">Thank you for contacting Piyakaru Hotel. regarding your inquiry:</p>

                            <div style="background: #f5f5f5; border-left: 4px solid #9e9e9e; padding: 15px; margin: 20px 0; color: #555; font-style: italic;">
                                "%s"
                            </div>

                            <p style="color: #333; font-weight: bold;">Our Response:</p>
                            <p style="color: #333;">%s</p>

                            <p style="color: #666; font-size: 14px; margin-top: 30px;">
                                If you have further questions, please feel free to reply to this email.
                            </p>
                            <p style="color: #666; font-size: 14px;">Best regards,<br>Piyakaru Hotel Team</p>
                        </div>
                    </div>
                    """
                    .formatted(name, originalMessage, replyMessage);

            helper.setText(htmlContent, true);
            mailSender.send(message);
        } catch (MessagingException e) {
            throw new RuntimeException("Failed to send email", e);
        }
    }

    @Async
    public void sendReservationReceivedEmail(String to, String guestName, String reservationType,
            String reservationDetails) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setFrom("infopiyakaru@gmail.com");
            helper.setTo(to);
            helper.setSubject("Piyakaru Hotel - Reservation Received");

            String htmlContent = """
                    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                        <div style="background: linear-gradient(135deg, #0b132b 0%%, #1c2541 100%%); color: #fff; padding: 30px; border-radius: 10px 10px 0 0;">
                            <h2 style="margin: 0; color: #fff;">Reservation Received</h2>
                        </div>
                        <div style="background: #fff; padding: 30px; border: 1px solid #e0e0e0; border-top: none; border-radius: 0 0 10px 10px;">
                            <p style="color: #333; font-size: 16px;">Dear %s,</p>
                            <p style="color: #333;">Thank you for your <strong>%s reservation</strong> request! We have received your booking and it is currently <strong>pending approval</strong> from our team.</p>

                            <div style="background: #fff8e1; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0;">
                                <h3 style="margin: 0 0 10px 0; color: #ff8f00;">Reservation Details:</h3>
                                <p style="margin: 5px 0; color: #333;">%s</p>
                                <p style="margin: 5px 0; color: #333;"><strong>Status:</strong> Pending Approval</p>
                            </div>

                            <p style="color: #333;">We will review your request and send you a confirmation email once it's approved.</p>
                            <p style="color: #666; font-size: 14px; margin-top: 30px;">
                                If you have any questions, please don't hesitate to contact us.
                            </p>
                            <p style="color: #666; font-size: 14px;">Best regards,<br>Piyakaru Hotel Team</p>
                        </div>
                    </div>
                    """
                    .formatted(guestName, reservationType, reservationDetails);

            helper.setText(htmlContent, true);
            mailSender.send(message);
        } catch (MessagingException e) {
            System.err.println("Failed to send reservation received email: " + e.getMessage());
        }
    }
}
