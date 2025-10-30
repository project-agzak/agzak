package com.ssafy.agzak.domain.ranking.support;

import java.util.*;

public final class RankCalculator {

    private RankCalculator() {}

    /** 경쟁랭킹(동점=같은 랭크, 다음은 건너뜀), 내림차순 기준 */
    public static <T extends Number & Comparable<T>> Integer competitionRank(List<T> all, T my) {
        if (my == null || all == null || all.isEmpty()) return null;
        List<T> sorted = new ArrayList<>(all);
        sorted.sort(Comparator.<T>naturalOrder().reversed());
        int rank = 1, i = 0;
        T prev = null;
        for (T s : sorted) {
            i++;
            if (prev == null || s.compareTo(prev) != 0) {
                rank = i;
                prev = s;
            }
            if (s.equals(my)) return rank;
        }
        return null;
    }

    public static double increasePct(Integer original, Integer total) {
        if (original == null || total == null) return 0.0;
        int denom = Math.max(1, original);
        return ((double)(total - original)) * 100.0 / denom;
    }
}
