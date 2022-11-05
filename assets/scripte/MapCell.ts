export enum ECellType {
    NOMAL,
    START,
    END,
    PATH,
    OBSTACLES,
}

const {ccclass, property, executeInEditMode} = cc._decorator;

@ccclass
@executeInEditMode
export default class MapCell extends cc.Component {
    @property(cc.Label)
    private eName: cc.Label = null;

    @property()
    private _type = 0;

    @property()
    get eType() {
        return this._type;
    }
    set eType(type) {
        this._type = type;
        this.setType(type);
    }

    private mOnClick: (pos: cc.Vec2) => void = null;
    private mX: number = null;
    private mY: number = null;

    protected onLoad(): void {
        this.node.on(cc.Node.EventType.TOUCH_END, this.onTouchEnd, this)
    }

    init(x: number, y: number, onClick: (pos: cc.Vec2) => void) {
        this.mX = x;
        this.mY = y;
        this.mOnClick = onClick;
        this.eName.string = `${x}_${y}`;
    }
    
    setType(type: number) {
        let color: cc.Color = cc.color(113, 190, 113);
        switch(type) {
            case ECellType.START: {
                color = cc.color(125, 125, 226);
                break;
            }
            case ECellType.END: {
                color = cc.color(226, 125, 125);
                break;
            }
            case ECellType.PATH: {
                color = cc.color(125, 226, 125);
                break;
            }
            case ECellType.OBSTACLES: {
                color = cc.color(125, 125, 125);
                break;
            }
            case ECellType.NOMAL: {
                color = cc.color(255, 255, 255);
                break;
            }
        }
        this.node.color = color;

    }

    onTouchEnd() {
        this.mOnClick && this.mOnClick(cc.v2(this.mX, this.mY));
    }
}
