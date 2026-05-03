package com.rakbank.onboarding.listener;

import org.flowable.engine.delegate.TaskListener;
import org.flowable.task.service.delegate.DelegateTask;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

@Component("taskNotificationListener")
public class TaskNotificationListener implements TaskListener {

    private static final Logger log = LoggerFactory.getLogger(TaskNotificationListener.class);

    @Override
    public void notify(DelegateTask delegateTask) {
        String companyName = (String) delegateTask.getVariable("companyName");
        String decision    = (String) delegateTask.getVariable("decision");
        String riskBand    = (String) delegateTask.getVariable("riskBand");
        log.info("════════════════════════════════════════════");
        log.info("  MANUAL REVIEW TASK CREATED");
        log.info("  Task ID   : {}", delegateTask.getId());
        log.info("  Company   : {}", companyName);
        log.info("  Reason    : {}", decision);
        log.info("  Risk Band : {}", riskBand);
        log.info("  SLA: 4 business hours");
        log.info("════════════════════════════════════════════");
    }
}
