package com.rakbank.onboarding.delegate;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.rakbank.onboarding.model.ScreeningResult;
import com.rakbank.onboarding.service.stub.DecisionEngineStub;
import org.flowable.engine.delegate.DelegateExecution;
import org.flowable.engine.delegate.JavaDelegate;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

@Component("decisionEngineDelegate")
public class DecisionEngineDelegate implements JavaDelegate {

    private static final Logger log = LoggerFactory.getLogger(DecisionEngineDelegate.class);

    @Autowired private DecisionEngineStub decisionEngineStub;
    @Autowired private ObjectMapper objectMapper;

    @Override
    public void execute(DelegateExecution execution) {
        String fircosoftStatus = (String) execution.getVariable("fircosoftStatus");
        String aecbStatus      = (String) execution.getVariable("aecbStatus");
        String scenario        = (String) execution.getVariable("scenario");
        String riskResultJson  = (String) execution.getVariable("riskResult");

        ScreeningResult riskResult;
        try {
            riskResult = objectMapper.readValue(riskResultJson, ScreeningResult.class);
        } catch (Exception e) {
            riskResult = ScreeningResult.builder().score(0.0).build();
        }

        String decision  = decisionEngineStub.decide(riskResult, fircosoftStatus, aecbStatus, scenario);
        String rationale = decisionEngineStub.describeDecision(decision);

        execution.setVariable("decision", decision);
        execution.setVariable("decisionRationale", rationale);
        log.info("[{}] Decision Engine: {} — {}", execution.getProcessInstanceId(), decision, rationale);
    }
}
