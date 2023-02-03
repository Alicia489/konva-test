import * as React from 'react';
import { Layer, Stage, Transformer, Text, Image, Line, Rect } from 'react-konva';

const RectangleComponent = ({ item, onNodeClick, isSelected, onDragEnded, onSelectByClickonSelect, onSelectByClick, isSelectedByClick, isInSelectMode, onChange }) => {
    const shapeRef = React.useRef();
    const trRef = React.useRef();

    React.useEffect(() => {
        if (isSelectedByClick) {
          // we need to attach transformer manually
          trRef.current.nodes([shapeRef.current]);
          trRef.current.getLayer().batchDraw();
        }
      }, [isSelectedByClick]);

    const handleTransformEnd = (e) => {

        // transformer is changing scale of the node
        // and NOT its width or height
        // but in the store we have only width and height
        // to match the data better we will reset scale on transform end
        const node = shapeRef.current;
        const scaleX = node.scaleX();
        const scaleY = node.scaleY();

        // we will reset it back
        node.scaleX(1);
        node.scaleY(1);
        onChange({
            ...item,
            x: node.x(),
            y: node.y(),
            rotation: node.rotation(),
            // set minimal value
            width: Math.max(5, node.width() * scaleX),
            height: Math.max(node.height() * scaleY),
        });
    }

    return (
        <React.Fragment>
            <Rect
                onClick={onSelectByClick}
                onTap={onSelectByClick}
                ref={shapeRef}

                x={item.x}
                y={item.y}
                width={item.width}
                height={item.height}
                rotation={item.rotation}
                fill={item.fill}
                stroke={item.isSelected || isSelectedByClick ? '#2d9cdb' : 'black'}
                draggable={!isInSelectMode} //if canvas in is selection mode, disable drag for invidual items
                onDragEnd={(e) => onDragEnded(e, item.id)}

                onTransformEnd={handleTransformEnd}
            />
            {isSelectedByClick && (
                <Transformer
                    ref={trRef}
                    boundBoxFunc={(oldBox, newBox) => {
                        // limit resize
                        if (newBox.width < 5 || newBox.height < 5) {
                            return oldBox;
                        }
                        return newBox;
                    }}
                />
            )}
        </React.Fragment>
    )
}

export default RectangleComponent;