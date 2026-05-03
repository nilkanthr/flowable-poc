package com.rakbank.onboarding.delegate;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.rakbank.onboarding.model.ScreeningResult;
import com.rakbank.onboarding.service.stub.AECBStub;
import org.flowable.engine.delegate.DelegateExecution;
import org.flowable.engine.delegate.JavaDelegate;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

@Component("aecbDelegate")
public class AECBDelegate implements JavaDelegate {

    private static final Logger log = LoggerFactory.getLogger(AECBDelegate.class);

    @Autowired private AECBStub aecbStub;
    @Autowired private ObjectMapper objectMapper;

    @Override
    public void execute(DelegateExecution execution) {
        String emiratesId  = (String) execution.getVariable("signatoryEmirates");
        String companyName = (String) execution.getVariable("companyName");
        String scenario    = (String) execution.getVariable("scenario");

        log.info("[{}] AECB credit check started — parallel thread", execution.getProcessInstanceId());
        ScreeningResult result = aecbStub.check(emiratesId, companyName, scenario);
        execution.setVariable("aecbResult", toJson(result));
        execution.setVariable("aecbStatus", result.getStatus());
        execution.setVariable("aecbScore", result.getScore());
        log.info("[{}] AECB result: {} — {}", execution.getProcessInstanceId(), result.getStatus(), result.getMessage());
    }

    private String toJson(Object obj) {
        try { return objectMapper.writeValueAsString(obj); } catch (Exception e) { return "{}"; }
    }
}
