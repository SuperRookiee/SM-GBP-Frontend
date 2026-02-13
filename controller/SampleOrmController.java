package controller;

import common.ApiResponse;
import common.PageRequest;
import common.PageResponse;
import entity.SampleItem;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Min;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import service.SampleItemService;

import java.util.List;

@Validated
@RestController
@RequestMapping("/api/sample/orm")
public class SampleOrmController {

    private final SampleItemService sampleItemService;

    public SampleOrmController(SampleItemService sampleItemService) {
        this.sampleItemService = sampleItemService;
    }

    @GetMapping("/{id}")
    public ApiResponse<SampleItem> getById(@PathVariable @Min(1) Long id) {
        return ApiResponse.success(sampleItemService.getById(id));
    }

    @PostMapping
    public ApiResponse<SampleItem> create(@Valid @RequestBody SampleItem sampleItem) {
        return ApiResponse.success(sampleItemService.create(sampleItem));
    }

    @PutMapping("/{id}")
    public ApiResponse<SampleItem> update(@PathVariable @Min(1) Long id,
                                          @Valid @RequestBody SampleItem sampleItem) {
        return ApiResponse.success(sampleItemService.update(id, sampleItem));
    }

    @DeleteMapping("/{id}")
    public ApiResponse<Void> delete(@PathVariable @Min(1) Long id) {
        sampleItemService.delete(id);
        return ApiResponse.success(null);
    }

    @GetMapping("/search")
    public ApiResponse<List<SampleItem>> search(@RequestParam(required = false) String name,
                                                 @RequestParam(required = false) String category,
                                                 @RequestParam(required = false) String status,
                                                 @RequestParam(required = false) Boolean active) {
        return ApiResponse.success(sampleItemService.search(name, category, status, active));
    }

    @GetMapping("/list")
    public ApiResponse<PageResponse<SampleItem>> list(@Valid PageRequest pageRequest) {
        return ApiResponse.success(sampleItemService.list(pageRequest));
    }
}
