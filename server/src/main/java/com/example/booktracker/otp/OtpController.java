package com.example.booktracker.otp;

import com.example.booktracker.book.exception.CustomBadRequestException;
import com.example.booktracker.extra_services.EmailService;
import com.example.booktracker.otp.exception.IncorrectOtpException;
import com.example.booktracker.otp.exception.InvalidOtpException;
import com.example.booktracker.user.UserService;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.Map;
import java.util.stream.Stream;

@RestController
@RequestMapping("/api/otp")
public class OtpController {

    private final OtpService otpService;
    private final EmailService emailService;
    private final UserService userService;

    @Autowired
    public OtpController(OtpService otpService, EmailService emailService, UserService userService) {
        this.otpService = otpService;
        this.emailService = emailService;
        this.userService = userService;
    }

    /**
     * Sends a One Time Password (OTP) to the user's registered email address for verification.
     *
     * This method checks if the user is registered before generating and sending the OTP.
     * If the user is not found, a {@link UsernameNotFoundException} is thrown. The OTP is generated,
     * saved in the database, and then sent to the specified email address.
     *
     * @param otpRequest an object containing the username and email address of the user
     * @return a {@link ResponseEntity} containing a message indicating the success of the operation
     * @throws UsernameNotFoundException if the user with the specified username is not registered
     */
    @Transactional
    @PostMapping("/send")
    public ResponseEntity<Map<String, String>> sendOtp(@RequestBody OtpRequestDTO otpRequest) {
        String username = otpRequest.getUsername();
        String email = otpRequest.getEmail();

        // user must be registered first to get an OTP for verification
        if (userService.findByUsername(username).isEmpty()) {
            throw new UsernameNotFoundException("An OTP could not be sent as user is not yet registered.");
        }

        // Generate the OTP
        String otp = otpService.generateOtp();

        // save otp with username
        otpService.save(otp, username);

        // send email with otp
        emailService.sendVerificationEmail(email, "Verify your ShelfQuest email.",
                "To verify your email address, please use the following One Time Password (OTP):\n\n" + otp);


        Map<String, String> responseMap = new HashMap<>();
        responseMap.put("message", "OTP has successfully been sent to the user.");

        return ResponseEntity.status(HttpStatus.CREATED).body(responseMap);
    }

    /**
     * Verifies the One Time Password (OTP) for a user and updates their verification status.
     *
     * This method checks if the provided OTP is active and correct for the specified user.
     * If the verification is successful, the OTP is deleted, and the user's verification status is updated.
     *
     * @param verifyOtpRequestDTO an object containing the username and OTP to be verified
     * @return a {@link ResponseEntity} containing a message indicating the success of the verification
     * @throws IncorrectOtpException if the provided OTP is incorrect
     * @throws InvalidOtpException if the user has no active OTP
     * @throws CustomBadRequestException if the username or OTP is missing
     */
    @Transactional
    @PostMapping("/verify")
    public ResponseEntity<Map<String, String>> verifyOtp(@RequestBody VerifyOtpRequestDTO verifyOtpRequestDTO) {
        // verify otp is active and correct for user
        otpService.verify(verifyOtpRequestDTO);

        // delete the otp once validated
        otpService.deleteOtpByUsername(verifyOtpRequestDTO.getUsername());

        // update user's verification status in the users table
        userService.verify(verifyOtpRequestDTO.getUsername());

        Map<String, String> responseMap = new HashMap<>();
        responseMap.put("message", "User is now verified and can login. ");

        return ResponseEntity.status(HttpStatus.CREATED).body(responseMap);
    }
}
