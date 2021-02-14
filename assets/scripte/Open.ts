

import AStar from "../lib/AStar";
import MapCell, { ECellType } from "./MapCell";

const {ccclass, property} = cc._decorator;

@ccclass
export default class Open extends cc.Component {

    @property(cc.Prefab)
    eCell: cc.Prefab = null;

    @property(cc.Node)
    eLayout: cc.Node = null;

    private star = new AStar();
    private mCells = {};
    start () {
        const size = cc.v2(10, 10);
        const start = cc.v2(1, 4);
        const end = cc.v2(9, 6);
        const obstacles = [
            // cc.v2(5, 0),
            cc.v2(5, 1),
            cc.v2(5, 2),
            cc.v2(5, 3),
            cc.v2(5, 4),
            cc.v2(5, 5),
            // cc.v2(5, 6),
            // cc.v2(5, 7),
            // cc.v2(5, 8),
        ];
        this.init(size, start, end, obstacles);
    }

    init(size: cc.Vec2, start: cc.Vec2, end: cc.Vec2, obstacles: cc.Vec2[] = []) {
        this.star.init(size.x, size.y);
        this.star.setStartNode(start.x, start.y);
        this.star.setEndNode(end.x, end.y);
        obstacles.forEach((ele) => {
            this.star.setObstacles(ele.x, ele.y);
        });

        this.star.run();

        this.mCells = {};
        this.eLayout.removeAllChildren();
        for (let y = 0; y < this.star.y; y++){
            for (let x = 0; x < this.star.x; x++) {
                const node = cc.instantiate(this.eCell);
                node.parent = this.eLayout;
                this.mCells[`${x}_${y}`] = node.getComponent(MapCell);
                this.mCells[`${x}_${y}`].init(x, y);
            }
        }

        obstacles.forEach((ele) => {
            this.setCell(ele.x, ele.y, ECellType.OBSTACLES);
        });
        const path = this.star.getPath();
        path.forEach((ele) => {
            this.setCell(ele.x, ele.y, ECellType.PATH);
        });
        this.setCell(start.x, start.y, ECellType.START);
        this.setCell(end.x, end.y, ECellType.END);

        this.eLayout.width = 2 + (50 + 2) * size.x;
        if (size.x > 10) {
            this.eLayout.scale = 10 / size.x;
        } else if (size.y > 10) {
            this.eLayout.scale = 10 / size.y;
        }
    }

    setCell(x: number, y: number, type: ECellType) {
        this.mCells[`${x}_${y}`].setType(type);
    }
}
