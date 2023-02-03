import * as React from 'react';
import { Layer, Stage, Text, Image, Line, Rect } from 'react-konva';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import Konva from 'konva';
import RectangleComponent from './rectangle';

let id = 1;

const Arena = () => {
    const CANVAS_VIRTUAL_WIDTH = 850;
    const CANVAS_VIRTUAL_HEIGHT = 700;
    const [elements, setElements] = React.useState([]);
    const stageRef = React.useRef();
    const dragUrl = React.useRef();
    const [selection, setSelection] = React.useState(null);
    const [isInSelectMode, setSelectionMode] = React.useState(null);
    const [selectedRects, setSelectedRects] = React.useState([]);
    const [selectedRectIdByClick, selectRectByClick] = React.useState([]);
    const [stageHeight, setHeight] = React.useState(100);

    // now you may want to make it visible even on small screens
    // we can just scale it
    const scale = Math.min(
        window.innerWidth / CANVAS_VIRTUAL_WIDTH,
        window.innerHeight / CANVAS_VIRTUAL_HEIGHT
    );

    React.useEffect(() => {
        setHeight(document.getElementById('stage').offsetHeight + 1)
    }, [])

    const updatePosition = (e, id) => {
        let newElements = elements.map(image => image.id === id ? {
            ...image,
            x: e.target.x(),
            y: e.target.y()
        } : image);

        setElements(newElements);
    }

    const onNodeClick = () => { }

    const alignToTop = () => {
        let newX = 50;
        let newY = 50;
        let stageDimensions = stageRef.current.getAttrs();
        let stageWidth = stageDimensions.width, stageHeight = stageDimensions.height; //assume

        let updateEles = elements.map((ele, index) => {
            if (!ele.isSelected) {
                return ele
            }

            let newele = { ...ele, x: newX, y: newY };
            newX += ele.width + 50;

            if ((newX - 50 - ele.width) >= stageWidth) { //end of stageX reached
                newX = 50 // reset x value
                newY = newY + ele.height + 50 //increment y value to go to next line
            }

            return newele;
        })

        setElements(updateEles)
    }

    //selecting the required elements;

    const selectionPreview =
        selection !== null && isInSelectMode ? (
            <Rect
                fill="rgba(86, 204, 242, 0.1)"
                stroke="#2d9cdb"
                x={selection.x}
                y={selection.y}
                width={selection.width}
                height={selection.height}
            />
        ) : null;

    const handleMouseDown = (e) => {
        e.evt.preventDefault();
        if (selection === null && isInSelectMode) {
            const stage = e.target.getStage();
            const { x: pointerX, y: pointerY } = stage.getPointerPosition();
            const pos = {
                x: pointerX - stage.x(),
                y: pointerY - stage.y()
            };
            setSelection({
                startX: pos.x,
                startY: pos.y,
                endX: pos.x,
                endY: pos.y,
                x: pos.x,
                y: pos.y,
                width: 0,
                height: 0
            });
        }
    }

    const handleMouseMove = (e) => {
        if (selection !== null && isInSelectMode) {
            const stage = e.target.getStage();
            const { x: pointerX, y: pointerY } = stage.getPointerPosition();
            const pos = {
                x: pointerX - stage.x(),
                y: pointerY - stage.y()
            };
            setSelection({
                ...selection,
                endX: pos.x,
                endY: pos.y,
                x: Math.min(selection.startX, pos.x),
                y: Math.min(selection.startY, pos.y),
                width: Math.abs(selection.startX - pos.x),
                height: Math.abs(selection.startY - pos.y)
            });
        }
    }

    const handleMouseUp = (e) => {
        e.evt.preventDefault();
        if (selection !== null) {
            // Calculate the selection and update app state
            getSelectedEntities(selection)
            setSelection(null);
            // setSelectionMode(false)
        }
    }

    const getSelectedEntities = (selectionArea) => {
        // const selectedNewRects = data.map((ele) => {...ele, })

        const selectedNewRects = elements.map((ele) => {
            return {
                ...ele,
                isSelected: Konva.Util.haveIntersection(selectionArea, ele)
            }
        })

        setElements(selectedNewRects);
    }

    //on outside click deselect all selected items-
    const detectOutsideClick = (e) => {
        const emptySpace = e.target === e.target.getStage();
        if (!emptySpace) {
            return;
        }

        const updatedRects = elements.map((ele) => {
            return {
                ...ele,
                isSelected: false
            }
        })

        setElements(updatedRects);
        selectRectByClick(null)
    }

    //transformer handling
    const onRectParamsChange = (newAttrs) => {
        console.log(newAttrs)
        let newElements = elements.map(ele => ele.id === newAttrs.id ? newAttrs : ele);
        setElements(newElements);
    }

    //handling when rectangle is dropped from outside
    const handleDragEnd = (e) => {
        if (!dragUrl.current) {
            return
        }

        e.preventDefault();
        // register event position
        stageRef.current.setPointersPositions(e);

        setElements(
            elements.concat([
                {
                    ...stageRef.current.getPointerPosition(),
                    type: dragUrl.current,
                    isDragging: false,
                    id: id++,
                    width: 50,
                    height: 50,
                    radius: 25,
                    rotation: 0,
                    fill: "white"
                },
            ])
        );

        dragUrl.current = '';
    }

    return (
        <div className='arena-container'>
            <Container maxWidth="lg" className='page-header'>
                <div className='square' onTouchStart={e => dragUrl.current = 'rect'} draggable="true" onDragStart={(e) => {
                    dragUrl.current = 'rect';
                }}>Drag me!</div>
                <Button variant="outlined" onClick={() => alignToTop()}>Align items to top</Button>
                <Button variant="outlined" nClick={() => setSelectionMode(true)}>{isInSelectMode ? 'Stop selection' : 'Select Items'}</Button>

            </Container>

            <Container maxWidth="lg">
                <div className='drawn-canvas-wrapper' id='stage' onDrop={handleDragEnd}
                    onTouchEndCapture={handleDragEnd}
                    onDragOver={(e) => e.preventDefault()}
                    >

                    <Stage
                        width={document.getElementById('stage')?.offsetWidth ?? 100}
                        height={stageHeight}
                        style={{ border: '1px dashed grey' }}
                        scaleX={scale} scaleY={scale}
                        ref={stageRef}
                        //selection related handling
                        onMouseDown={handleMouseDown}
                        onMouseMove={handleMouseMove}
                        // draggable={!isInSelectMode}
                        // listening={!isInSelectMode}
                        // onDragStart={handleMouseDown}
                        // onDragMove={handleMouseMove}
                        onClick={detectOutsideClick}
                        onMouseUp={handleMouseUp}
                    >

                        <Layer>
                            {
                                elements.map((item, index) => {
                                    return <RectangleComponent item={item} onNodeClick={(item) => onNodeClick(item)}
                                        onDragEnded={(e, id) => updatePosition(e, id)}
                                        key={item.id}
                                        isSelected={selectedRects.findIndex(e => e.id === item.id) !== -1}
                                        onSelectByClick={() => {
                                            selectRectByClick(item.id);
                                        }}
                                        onChange={(newAttrs) => onRectParamsChange(newAttrs)}
                                        isSelectedByClick={item.id === selectedRectIdByClick}
                                        onSelect={() => { }} isInSelectMode={isInSelectMode}
                                    />
                                })
                            }
                        </Layer>
                        <Layer>
                            {selectionPreview}
                        </Layer>
                    </Stage>
                </div>
            </Container>
        </div>
    );
}

export default Arena;