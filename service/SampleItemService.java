package service;

import common.PageRequest;
import common.PageResponse;
import entity.SampleItem;

import java.util.List;

public interface SampleItemService {

    SampleItem getById(Long id);

    SampleItem create(SampleItem sampleItem);

    SampleItem update(Long id, SampleItem sampleItem);

    void delete(Long id);

    List<SampleItem> search(String name, String category, String status, Boolean active);

    PageResponse<SampleItem> list(PageRequest pageRequest);
}
