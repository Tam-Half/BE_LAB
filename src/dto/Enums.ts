export enum BookingStatus {
    PENDING = "PENDING",
    CONFIRMED = "CONFIRMED",
    CANCELLED = "CANCELLED",
    CHECKED_IN = "CHECKED_IN",
    COMPLETED = "COMPLETED",
    EXPIRED = "EXPIRED"
}

export enum BookingRoomAllocationStatus {
    NOT_CHECKED_IN = "NOT_CHECKED_IN",
    CHECKED_IN = "CHECKED_IN",
    CANCELLED = "CANCELLED"
}

export enum ServiceOrderStatus {
    PENDING = "pending",
    FULFILLED = "fulfilled",
    CANCELLED = "cancelled"
}

export enum PaymentStatus {
    PENDING = "pending",
    PAID = "paid",
    FAILED = "failed",
    CANCELLED = "cancelled"
}

export enum UserRole {
    ADMIN = "admin",
    USER = "user",
    STAFF = "staff"
}

export enum RoomStatus {
    AVAILABLE = "AVAILABLE",
    OCCUPIED = "OCCUPIED",
    MAINTENANCE = "MAINTENANCE",
    DIRTY = "DIRTY"
}
