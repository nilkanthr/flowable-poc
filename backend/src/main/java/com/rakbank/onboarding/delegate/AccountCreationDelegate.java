package com.rakbank.onboarding.delegate;

import org.flowable.engine.delegate.DelegateExecution;
import org.flowable.engine.delegate.JavaDelegate;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.util.Random;

@Component("accountCreationDelegate")
public class AccountCreationDelegate implements JavaDelegate {

    private static final Logger log = LoggerFactory.getLogger(AccountCreationDelegate.class);

    @Value("${demo.account-creation-delay-ms:1000}")
    private long delayMs;

    @Override
    public void execute(DelegateExecution execution) {
        String companyName = (String) execution.getVariable("companyName");
        log.info("[{}] Creating bank account in core banking (T24 stub) for: {}", execution.getProcessInstanceId(), companyName);

        try { Thread.sleep(delayMs); } catch (InterruptedException e) { Thread.currentThread().interrupt(); }

        String accountNumber = String.format("%010d", (long)(Math.random() * 9_000_000_000L) + 1_000_000_000L);
        String iban    = "AE" + String.format("%02d", new Random().nextInt(99)) + "0330000" + accountNumber;
        String sortCode = "033-" + String.format("%04d", new Random().nextInt(9999));

        execution.setVariable("accountNumber", accountNumber);
        execution.setVariable("iban", iban);
        execution.setVariable("sortCode", sortCode);
        execution.setVariable("accountStatus", "ACTIVE");
        log.info("[{}] Account created — IBAN: {}", execution.getProcessInstanceId(), iban);
    }
}
