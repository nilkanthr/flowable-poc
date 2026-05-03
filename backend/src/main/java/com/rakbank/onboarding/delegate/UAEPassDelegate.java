package com.rakbank.onboarding.delegate;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.rakbank.onboarding.model.ScreeningResult;
import com.rakbank.onboarding.service.stub.UAEPassStub;
import org.flowable.engine.delegate.DelegateExecution;
import org.flowable.engine.delegate.JavaDelegate;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

@Component("uaePassDelegate")
public class UAEPassDelegate implements JavaDelegate {

    private static final Logger log = LoggerFactory.getLogger(UAEPassDelegate.class);

    @Autowired private UAEPassStub uaePassStub;
    @Autowired private ObjectMapper objectMapper;

    @Override
    public void execute(DelegateExecution execution) {
        String companyName = (String) execution.getVariable("companyName");
        String emiratesId  = (String) execution.getVariable("signatoryEmirates");
        String uaePassId   = (String) execution.getVariable("signatoryUaePassId");
        String scenario    = (String) execution.getVariable("scenario");

        log.info("[{}] UAE Pass verification started for: {}", execution.getProcessInstanceId(), companyName);
        ScreeningResult result = uaePassStub.verify(emiratesId, uaePassId, scenario);
        execution.setVariable("uaePassResult", toJson(result));
        execution.setVariable("uaePassStatus", result.getStatus());
        log.info("[{}] UAE Pass result: {} — {}", execution.getProcessInstanceId(), result.getStatus(), result.getMessage());
    }

    private String toJson(Object obj) {
        try { return objectMapper.writeValueAsString(obj); } catch (Exception e) { return "{}"; }
    }
}
