package com.ssafy.agzak.global.tx;

import org.springframework.transaction.support.TransactionSynchronization;
import org.springframework.transaction.support.TransactionSynchronizationManager;

public final class TxAfterCommit {
    private TxAfterCommit(){}
    public static void afterCommit(Runnable r) {
        if (TransactionSynchronizationManager.isSynchronizationActive()) {
            TransactionSynchronizationManager.registerSynchronization(
                    new TransactionSynchronization() {
                        @Override public void afterCommit() { r.run(); }
                    }
            );
        } else {
            r.run();
        }
    }
}
