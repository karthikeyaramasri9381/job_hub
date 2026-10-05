from rest_framework import permissions
from accounts.models import User


class IsCandidate(permissions.BasePermission):
    """Allows access only to authenticated users with the CANDIDATE role."""
    
    def has_permission(self, request, view):
        return bool(
            request.user and 
            request.user.is_authenticated and 
            request.user.role == User.Role.CANDIDATE
        )


class IsRecruiter(permissions.BasePermission):
    """Allows access only to authenticated users with the RECRUITER role."""
    
    def has_permission(self, request, view):
        return bool(
            request.user and 
            request.user.is_authenticated and 
            request.user.role == User.Role.RECRUITER
        )


class IsAdminRole(permissions.BasePermission):
    """Allows access only to authenticated users with ADMIN role or staff privileges."""
    
    def has_permission(self, request, view):
        return bool(
            request.user and 
            request.user.is_authenticated and 
            (request.user.role == User.Role.ADMIN or request.user.is_staff or request.user.is_superuser)
        )


class IsCandidateOwner(permissions.BasePermission):
    """Object-level permission allowing candidates to access only their own resources."""

    def has_object_permission(self, request, view, obj):
        if not (request.user and request.user.is_authenticated):
            return False

        # If object is User
        if isinstance(obj, User):
            return obj == request.user

        # If object has candidate relationship
        if hasattr(obj, 'candidate') and hasattr(obj.candidate, 'user'):
            return obj.candidate.user == request.user

        # If object is CandidateProfile
        if hasattr(obj, 'user'):
            return obj.user == request.user

        return False


class IsRecruiterJobOwner(permissions.BasePermission):
    """Object-level permission allowing recruiters to modify only jobs they created."""

    def has_object_permission(self, request, view, obj):
        if not (request.user and request.user.is_authenticated and request.user.role == User.Role.RECRUITER):
            return False

        # If object is Job
        if hasattr(obj, 'created_by'):
            return obj.created_by == request.user

        # If object has job relationship (e.g., Application)
        if hasattr(obj, 'job') and hasattr(obj.job, 'created_by'):
            return obj.job.created_by == request.user

        return False


class IsRecruiterCompanyOwner(permissions.BasePermission):
    """Object-level permission allowing recruiters to manage only their assigned company."""

    def has_object_permission(self, request, view, obj):
        if not (request.user and request.user.is_authenticated and request.user.role == User.Role.RECRUITER):
            return False

        if hasattr(request.user, 'recruiter_profile') and request.user.recruiter_profile.company:
            return request.user.recruiter_profile.company == obj

        return False
