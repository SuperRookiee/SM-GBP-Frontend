package mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import entity.SampleItem;
import org.apache.ibatis.annotations.Mapper;

@Mapper
public interface SampleItemMapper extends BaseMapper<SampleItem> {
}
