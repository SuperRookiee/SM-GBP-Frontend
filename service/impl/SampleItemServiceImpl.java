package service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import common.BizException;
import common.PageRequest;
import common.PageResponse;
import common.ResultCode;
import entity.SampleItem;
import mapper.SampleItemMapper;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import service.SampleItemService;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class SampleItemServiceImpl implements SampleItemService {

    private final SampleItemMapper sampleItemMapper;

    public SampleItemServiceImpl(SampleItemMapper sampleItemMapper) {
        this.sampleItemMapper = sampleItemMapper;
    }

    @Override
    public SampleItem getById(Long id) {
        SampleItem found = sampleItemMapper.selectById(id);
        if (found == null) {
            throw new BizException(ResultCode.NOT_FOUND);
        }
        return found;
    }

    @Override
    public SampleItem create(SampleItem sampleItem) {
        LambdaQueryWrapper<SampleItem> duplicateWrapper = new LambdaQueryWrapper<SampleItem>()
                .eq(SampleItem::getName, sampleItem.getName());
        if (sampleItemMapper.selectCount(duplicateWrapper) > 0) {
            throw new BizException(ResultCode.CONFLICT);
        }

        LocalDateTime now = LocalDateTime.now();
        sampleItem.setCreatedAt(now);
        sampleItem.setUpdatedAt(now);
        sampleItemMapper.insert(sampleItem);
        return sampleItem;
    }

    @Override
    public SampleItem update(Long id, SampleItem sampleItem) {
        SampleItem existing = sampleItemMapper.selectById(id);
        if (existing == null) {
            throw new BizException(ResultCode.NOT_FOUND);
        }

        existing.setName(sampleItem.getName());
        existing.setDescription(sampleItem.getDescription());
        existing.setCategory(sampleItem.getCategory());
        existing.setStatus(sampleItem.getStatus());
        existing.setPriority(sampleItem.getPriority());
        existing.setQuantity(sampleItem.getQuantity());
        existing.setPrice(sampleItem.getPrice());
        existing.setRate(sampleItem.getRate());
        existing.setActive(sampleItem.getActive());
        existing.setDueDate(sampleItem.getDueDate());
        existing.setMemo(sampleItem.getMemo());
        existing.setUpdatedAt(LocalDateTime.now());

        sampleItemMapper.updateById(existing);
        return existing;
    }

    @Override
    public void delete(Long id) {
        SampleItem existing = sampleItemMapper.selectById(id);
        if (existing == null) {
            throw new BizException(ResultCode.NOT_FOUND);
        }
        sampleItemMapper.deleteById(id);
    }

    @Override
    public List<SampleItem> search(String name, String category, String status, Boolean active) {
        LambdaQueryWrapper<SampleItem> query = new LambdaQueryWrapper<SampleItem>()
                .like(StringUtils.hasText(name), SampleItem::getName, name)
                .eq(StringUtils.hasText(category), SampleItem::getCategory, category)
                .eq(StringUtils.hasText(status), SampleItem::getStatus, status)
                .eq(active != null, SampleItem::getActive, active);

        return sampleItemMapper.selectList(query);
    }

    @Override
    public PageResponse<SampleItem> list(PageRequest pageRequest) {
        Page<SampleItem> page = new Page<>(pageRequest.getPage(), pageRequest.getSize());
        Page<SampleItem> result = sampleItemMapper.selectPage(page, new LambdaQueryWrapper<>());
        return PageResponse.of(result.getRecords(), result.getTotal(), result.getCurrent(), result.getSize());
    }
}
