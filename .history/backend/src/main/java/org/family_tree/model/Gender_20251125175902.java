package org.family_tree.model;

import com.fasterxml.jackson.annotation.JsonValue;

import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;

public enum Gender {
    MALE("Мужской", "male", "М"),
    FEMALE("Женский", "female", "Ж"),
    UNKNOWN("Не указан", "unknown", "?");

    private final String displayName;
    private final String code;
    private final String shortName;

    Gender(String displayName, String code, String shortName) {
        this.displayName = displayName;
        this.code = code;
        this.shortName = shortName;
    }

    @Enumerated(EnumType.STRING)

    @JsonValue
    public String toValue() {
        return this.name();
    }

    public String getDisplayName() {
        return displayName;
    }

    public String getCode() {
        return code;
    }

    public String getShortName() {
        return shortName;
    }

    public static Gender fromString(String value) {
        if (value == null)
            return UNKNOWN;

        switch (value.toLowerCase()) {
            case "male":
            case "мужской":
            case "м":
            case "m":
                return MALE;
            case "female":
            case "женский":
            case "ж":
            case "f":
                return FEMALE;
            default:
                return UNKNOWN;
        }
    }

    public static Gender fromCode(String code) {
        if (code == null)
            return UNKNOWN;

        for (Gender gender : values()) {
            if (gender.getCode().equalsIgnoreCase(code)) {
                return gender;
            }
        }
        return UNKNOWN;
    }

    /**
     * Получить все значения для использования в формах
     */
    public static Gender[] getAllGenders() {
        return values();
    }

    /**
     * Проверить, является ли пол мужским
     */
    public boolean isMale() {
        return this == MALE;
    }

    /**
     * Проверить, является ли пол женским
     */
    public boolean isFemale() {
        return this == FEMALE;
    }

    /**
     * Получить противоположный пол (для поиска партнеров)
     */
    public Gender getOpposite() {
        switch (this) {
            case MALE:
                return FEMALE;
            case FEMALE:
                return MALE;
            default:
                return UNKNOWN;
        }
    }

    @Override
    public String toString() {
        return displayName;
    }

}
