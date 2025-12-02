"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importStar(require("mongoose"));
const EnemySchema = new mongoose_1.Schema({
    id: {
        type: String,
        required: true,
    },
    name: {
        type: String,
        required: true,
        trim: true,
    },
    level: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "Level",
        required: true,
        index: true,
    },
    maxHealth: {
        type: Number,
        required: true,
        min: 1,
    },
    attackDamage: {
        type: Number,
        required: true,
        min: 0,
    },
    defense: {
        type: Number,
        required: true,
        min: 0,
    },
    experience: {
        type: Number,
        required: true,
        min: 0,
    },
    bonus: {
        type: {
            type: String,
            enum: ["hp", "attack", "regeneration", "defense"],
            required: true,
        },
        amount: {
            type: Number,
            required: true,
            min: 0.1,
        },
    },
    sprites: {
        idle: { type: String, required: true },
        attack: { type: String, required: true },
        hurt: { type: String, required: true },
        defeated: { type: String, required: true },
    },
    spawnWeight: {
        type: Number,
        default: 50,
        min: 1,
        max: 100,
    },
    isActive: {
        type: Boolean,
        default: true,
    },
}, {
    timestamps: true,
});
// Compound index for optimized queries
EnemySchema.index({ level: 1, isActive: 1, spawnWeight: -1 });
const Enemy = mongoose_1.default.model("Enemy", EnemySchema);
exports.default = Enemy;
