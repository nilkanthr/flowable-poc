package com.rakbank.onboarding.delegate;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.rakbank.onboarding.model.ScreeningResult;
import com.rakbank.onboarding.service.stub.ThreatMatrixStub;
import org.flowable.engine.delegate.DelegateExecution;
import org.flowable.engine.delegate.JavaDelegate;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

@Component("threatMatrixDelegate")
public class ThreatMatrixDelegate implements JavaDelegate {

    private static final Logger log = LoggerFactory.getLogger(ThreatMatrixDelegate.class);

    @Autowired private ThreatMatrixStub threatMatrixStub;
    @Autowired private ObjectMapper objectMapper;

    @Override
    public void execute(DelegateExecution execution) {
        String email    = (String) execution.getVariable("email");
        String phone    = (String) execution.getVariable("phone");
        String scenario = (String) execution.getVariable("scenario");

        log.info("[{}] ThreatMetrix fraud check started — parallel thread", execution.getProcessInstanceId());
        ScreeningResult result = threatMatrixStub.assess(email, phone, "127.0.0.1", scenario);
        execution.setVariable("threatMatrixResult", toJson(result));
        execution.setVariable("threatMatrixStatus", result.getStatus());
        log.info("[{}] ThreatMetrix result: {} — {}", execution.getProcessInstanceId(), result.getStatus(), result.getMessage());
    }

    private String toJson(Object obj) {
        try { return objectMapper.writeValueAsString(obj); } catch (Exception e) { return "{}"; }
    }
}
