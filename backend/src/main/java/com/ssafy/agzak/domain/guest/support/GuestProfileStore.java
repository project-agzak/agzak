package com.ssafy.agzak.domain.guest.support;

import com.ssafy.agzak.domain.guest.dto.GuestProfile;

public interface GuestProfileStore {
    String save(GuestProfile profile);
    GuestProfile find(String guestId);
    void delete(String guestId);
}
