"use client";

import { CheckCircle2, XCircle } from "lucide-react";

interface PasswordValidation {
    length: boolean;
    lowercase: boolean;
    uppercase: boolean;
    special: boolean;
}

interface PasswordValidatorProps {
    validation: PasswordValidation;
    passwordsMatch: boolean;
}

export default function PasswordValidator({ validation, passwordsMatch }: PasswordValidatorProps) {
    return (
        <div className="text-sm mt-2 mb-4 space-y-1">
            <div className="flex items-center gap-2">
                {validation.length ? (
                    <CheckCircle2 className="text-green-500 w-4 h-4" />
                ) : (
                    <XCircle className="text-red-500 w-4 h-4" />
                )}
                <span>At least 8 characters</span>
            </div>
            <div className="flex items-center gap-2">
                {validation.lowercase ? (
                    <CheckCircle2 className="text-green-500 w-4 h-4" />
                ) : (
                    <XCircle className="text-red-500 w-4 h-4" />
                )}
                <span>Contains lowercase letter</span>
            </div>
            <div className="flex items-center gap-2">
                {validation.uppercase ? (
                    <CheckCircle2 className="text-green-500 w-4 h-4" />
                ) : (
                    <XCircle className="text-red-500 w-4 h-4" />
                )}
                <span>Contains uppercase letter</span>
            </div>
            <div className="flex items-center gap-2">
                {validation.special ? (
                    <CheckCircle2 className="text-green-500 w-4 h-4" />
                ) : (
                    <XCircle className="text-red-500 w-4 h-4" />
                )}
                <span>Contains special character</span>
            </div>
            <div className="flex items-center gap-2">
                {passwordsMatch ? (
                    <CheckCircle2 className="text-green-500 w-4 h-4" />
                ) : (
                    <XCircle className="text-red-500 w-4 h-4" />
                )}
                <span>Passwords match</span>
            </div>
        </div>
    );
}
