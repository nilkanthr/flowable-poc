package com.rakbank.onboarding.delegate;

import org.flowable.engine.delegate.DelegateExecution;
import org.flowable.common.engine.api.delegate.Expression;
import org.flowable.engine.delegate.JavaDelegate;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

@Component("notificationDelegate")
public class NotificationDelegate implements JavaDelegate {

    private static final Logger log = LoggerFactory.getLogger(NotificationDelegate.class);

    private Expression notificationType;

    @Override
    public void execute(DelegateExecution execution) {
        String type        = notificationType != null ? (String) notificationType.getValue(execution) : "UNKNOWN";
        String companyName = (String) execution.getVariable("companyName");
        String email       = (String) execution.getVariable("email");

        switch (type) {
            case "WELCOME" -> {
                String iban = (String) execution.getVariable("iban");
                log.info("[{}] [NOTIFICATION] Welcome email → {} ({}) — IBAN: {}",
                         execution.getProcessInstanceId(), companyName, email, iban);
                execution.setVariable("notificationSent", "WELCOME");
            }
            case "REJECTION" -> {
                String rationale = (String) execution.getVariable("decisionRationale");
                log.info("[{}] [NOTIFICATION] Rejection letter → {} ({}) — Reason: {}",
                         execution.getProcessInstanceId(), companyName, email, rationale);
                execution.setVariable("notificationSent", "REJECTION");
            }
            case "ESCALATION" -> {
                log.warn("[{}] [ESCALATION] Manual review SLA breached for {} — escalating to Senior Manager",
                         execution.getProcessInstanceId(), companyName);
                execution.setVariable("notificationSent", "ESCALATION");
            }
            default -> log.info("[{}] [NOTIFICATION] type={} for {}",
                                execution.getProcessInstanceId(), type, companyName);
        }
    }
}
