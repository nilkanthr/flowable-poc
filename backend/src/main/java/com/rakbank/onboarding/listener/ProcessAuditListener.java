package com.rakbank.onboarding.listener;

import org.flowable.engine.delegate.DelegateExecution;
import org.flowable.engine.delegate.ExecutionListener;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

@Component("processAuditListener")
public class ProcessAuditListener implements ExecutionListener {

    private static final Logger log = LoggerFactory.getLogger(ProcessAuditListener.class);

    @Override
    public void notify(DelegateExecution execution) {
        String companyName = (String) execution.getVariable("companyName");
        log.info("═══════════════════════════════════════════════════════");
        log.info("  RAKBANK Account Onboarding STARTED");
        log.info("  Process Instance : {}", execution.getProcessInstanceId());
        log.info("  Company          : {}", companyName);
        log.info("  Business Key     : {}", execution.getProcessInstanceBusinessKey());
        log.info("═══════════════════════════════════════════════════════");
    }
}
